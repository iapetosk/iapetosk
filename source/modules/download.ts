import * as node_fs from "fs";
import * as node_path from "path";
import * as node_events from "events";

import read from "@/modules/hitomi/read";
import settings from "@/modules/settings";
import listener from "@/modules/listener";
import storage from "@/modules/storage";
import request from "@/modules/request";
import worker from "@/statics/worker";

import { StaticEvent } from "@/statics";
import { PartialOptions, RequestProgress } from "@/modules/request";

export enum TaskJob {
	CREATE = "create",
	DESTROY = "destroy"
};
export enum TaskStatus {
	NONE,
	FINISHED,
	WORKING,
	QUEUED,
	PAUSED,
	ERROR
};
export enum TaskFolder {
	DEBUGS = "debugs",
	BUNDLES = "bundles",
	DOWNLOADS = "downloads"
};
export class TaskFile {
	public url: string;
	public path: string;
	public size: number;
	public written: number;
	constructor(url: string, path: string, size: number = NaN, written: number = 0) {
		this.url = url;
		this.path = path;
		this.size = size;
		this.written = written;
	}
}
export class Task {
	public id: number;
	public from: string;
	public title: string;
	public files: TaskFile[];
	public status: TaskStatus;
	public options: PartialOptions;
	public working: number;
	public finished: number;
	constructor(from: string, title: string, files: TaskFile[], options: PartialOptions = {}, id: number = Date.now()) {
		this.id = id;
		this.from = from;
		this.title = title;
		this.files = files;
		this.status = TaskStatus.NONE;
		this.options = options;
		this.working = 0;
		this.finished = 0;
	}
}
export class Download {
	public max_threads: number;
	public max_working: number;
	constructor(max_threads: number, max_working: number) {
		this.max_threads = max_threads;
		this.max_working = max_working;
		listener.on(StaticEvent.WORKER, ($index: number, $new: Task | undefined) => {
			// bundle exist
			if (storage.exist(String($index))) {
				// update storage
				storage.set_data(String($index), { ...$new });
			}
			// else alone is enough
			else if ($new?.status !== TaskStatus.QUEUED) {
				// remove
				this.remove($index);
			}
		});
		// if folder exists
		if (node_fs.existsSync(TaskFolder.BUNDLES)) {
			// loop files within
			for (const file of node_fs.readdirSync(TaskFolder.BUNDLES)) {
				// check if file is .json
				if (node_fs.statSync(node_path.join(TaskFolder.BUNDLES, file)).isFile() && node_path.extname(file) === ".json") {
					// read task from .json
					storage.register(file.split(/\./)[0], node_path.join(TaskFolder.BUNDLES, file), "@import");

					const task: Task = storage.get_data(file.split(/\./)[0]);

					switch (task.status) {
						case TaskStatus.NONE:
						case TaskStatus.WORKING: {
							this.create(task);
							break;
						}
						default: {
							worker.set(task.id, task);
							break;
						}
					}
				}
			}
		}
	}
	public create(task: Task) {
		const observer = new node_events.EventEmitter, files: number[] = [];
		return new Promise<TaskStatus>((resolve, reject) => {
			function update(key: "id" | "from" | "title" | "files" | "status" | "options" | "working" | "finished", value: any) {
				// update task
				task[key] = value as never;
				// update worker
				worker.set(task.id, { ...task });
			}
			observer.on(TaskJob.CREATE, (index: number) => {
				if (task.status !== TaskStatus.WORKING || !storage.get_data(String(task.id))) {
					update("status", TaskStatus.NONE);
					return observer.emit(TaskJob.DESTROY);
				}
				update("working", task.working + 1);
				// generates directory recursively
				node_fs.mkdirSync(node_path.dirname(task.files[files[index]].path), { recursive: true });
				// create WriteStream
				const writable = node_fs.createWriteStream(task.files[files[index]].path);
				// make a request
				request.GET(task.files[files[index]].url, { ...task.options, headers: { ...task.options.headers, ...task.files[files[index]].written ? { "content-range": `bytes=${task.files[files[index]].written}-` } : {} } }, "binary",
					(chunk, progress) => {
						writable.write(chunk);
						task.files[files[index]].size = progress[RequestProgress.TOTAL_SIZE];
						task.files[files[index]].written += chunk.toString("binary").length;
						update("files", task.files);
					}).then(() => {
						writable.end();

						if (task.status !== TaskStatus.WORKING || !storage.get_data(String(task.id))) {
							update("status", TaskStatus.NONE);
							return observer.emit(TaskJob.DESTROY);
						}
						update("finished", task.finished + 1);

						if (!!files[task.working] && task.working - task.finished < this.max_working) {
							return observer.emit(TaskJob.CREATE, task.working);
						}
						if (task.finished === files.length) {
							update("status", TaskStatus.FINISHED);
							return observer.emit(TaskJob.DESTROY);
						}
					});
				if (!!files[task.working] && task.working - task.finished < this.max_working) {
					return observer.emit(TaskJob.CREATE, task.working);
				}
			});
			observer.once(TaskJob.DESTROY, () => {
				// stop observe
				observer.removeAllListeners();
				// start queued task
				if (task.status !== TaskStatus.QUEUED) {
					for (const queued of worker.filter({ key: "status", value: TaskStatus.QUEUED })) {
						this.create(queued);
						break;
					}
				}
				return resolve(task.status);
			});
			// register storage
			if (!storage.exist(String(task.id))) {
				storage.register(String(task.id), node_path.join(TaskFolder.BUNDLES, String(task.id) + ".json"), { ...task });
			}
			// task counts reached its limit
			if (this.max_threads <= worker.filter({ key: "status", value: TaskStatus.WORKING }).length) {
				update("status", TaskStatus.QUEUED);
				return observer.emit(TaskJob.DESTROY);
			}
			// scan unfinished files
			for (let index = 0; index < task.files.length; index++) {
				if (task.files[index].written !== task.files[index].size) {
					files.push(index);
				}
			}
			// task is finished
			if (!files.length) {
				update("status", TaskStatus.FINISHED);
				return observer.emit(TaskJob.DESTROY);
			}
			// update status
			update("status", TaskStatus.WORKING);
			// download recursivly
			return observer.emit(TaskJob.CREATE, 0);
		});
	}
	public remove(id: number) {
		return new Promise<void>((resolve, reject) => {
			// remove storage
			storage.un_register(String(id));
			// remove worker
			worker.set(id, undefined);
			node_fs.rmdir(node_path.join(TaskFolder.DOWNLOADS, String(id)), { recursive: true }, () => {
				return resolve();
			});
		});
	}
	public evaluate(url: string) {
		return new Promise<Task>((resolve, reject) => {
			for (const RegExp of [/^https?:\/\/hitomi.la\/galleries\/([\d]+).html$/, /^https?:\/\/hitomi.la\/(reader|manga|doujinshi|gamecg|cg)\/([\D\d]+)-([\D\d]+)-([\d]+).html$/]) {
				switch (RegExp.test(url)) {
					case true: {
						return read.script(Number(/([0-9]+).html$/.exec(url)![1])).then((script) => {
							return resolve(
								new Task(url, script.title, script.files.map((value, index) => {
									return new TaskFile(value.url, node_path.join(TaskFolder.DOWNLOADS, String(script.id), `${index}.${value.url.split(/\./).pop()}`));
								}), { headers: { "referer": "https://hitomi.la" } }, script.id)
							);
						});
					}
					case false: {
						return reject();
					}
				}
			}
		});
	}
}
export default (new Download(settings.download.max_threads, settings.download.max_working));
