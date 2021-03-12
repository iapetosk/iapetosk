import * as node_fs from "fs";
import * as node_path from "path";

import scheme from "@/assets/scheme.json";

import read from "@/modules/hitomi/read";
import settings from "@/modules/settings";
import storage from "@/modules/storage";
import request from "@/modules/request";
import worker from "@/statics/worker";

import { BridgeEvent } from "@/common";
import { StaticEvent } from "@/statics";
import { PartialOptions, RequestProgress } from "@/modules/request";

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
		window.static.on(StaticEvent.WORKER, (args) => {
			const [$index, $new, $old] = args as [number, Task | undefined, Task | undefined];

			if (storage.exist(String($index)) && $old) {
				// first time deleteed
				if (!$new) {
					// delete
					this.delete($index);
				} else {
					// update storage
					storage.set_data(String($index), { ...$new });
				}
			}
		});
		// if folder exists
		if (node_fs.existsSync(TaskFolder.BUNDLES)) {
			// loop files within
			for (const file of node_fs.readdirSync(TaskFolder.BUNDLES)) {
				// check if file is .json
				if (node_fs.statSync(node_path.join(TaskFolder.BUNDLES, file)).isFile() && node_path.extname(file) === ".json") {
					/*
					0: name
					1: extension
					*/
					const [ID] = file.split(/\./) as [string, string];
					// register task from .json
					storage.register(ID, node_path.join(TaskFolder.BUNDLES, file), "@import");
					// create task from .json
					const task = storage.get_data<Task>(ID);
					// restart download
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
		const I = this;
		return new Promise<TaskStatus>((resolve, reject) => {
			const files: number[] = [];
			// declare worker
			worker.set(task.id, { ...task });
			function update(key: keyof Task, value: Task[keyof Task]) {
				if (!worker.get()[task.id]) {
					return destroy();
				}
				// update task
				task[key] = value as never;
				// update worker
				worker.set(task.id, { ...task });
			}
			function spawn(index: number): void {
				// update
				update("working", task.working + 1);
				// generates directory recursively
				node_fs.mkdirSync(node_path.dirname(task.files[files[index]].path), { recursive: true });
				// create WriteStream
				const writable = node_fs.createWriteStream(task.files[files[index]].path);
				// make a request
				request.GET(task.files[files[index]].url, { ...task.options, headers: { ...task.options.headers, ...task.files[files[index]].written ? { "content-range": `bytes=${task.files[files[index]].written}-` } : {} } }, "binary",
					(chunk, progress) => {
						// write file
						writable.write(chunk);
						// update
						update("files", { ...task.files, [files[index]]: { ...task.files[files[index]], size: progress[RequestProgress.TOTAL_SIZE], written: task.files[files[index]].written + chunk.length } });
					}).then(() => {
						// stop writing
						writable.end();
						// update
						update("finished", task.finished + 1);

						if (Boolean(files[task.working]) && task.working - task.finished < I.max_working) {
							return spawn(task.working);
						}
						if (task.finished === files.length) {
							// update
							update("status", TaskStatus.FINISHED);
							return destroy();
						}
					});
				if (Boolean(files[task.working]) && task.working - task.finished < I.max_working) {
					return spawn(task.working);
				}
			};
			function destroy() {
				// start queued task
				if (task.status !== TaskStatus.QUEUED) {
					for (const queued of Object.values(worker.get()).filter(($task) => { return $task.status === TaskStatus.QUEUED; })) {
						I.create(queued);
						break;
					}
				}
				return resolve(task.status);
			}
			window.bridge.on(BridgeEvent.BEFORE_CLOSE, () => {
				// resolve anyways
				return resolve(task.status);
			});
			// register storage
			if (!storage.exist(String(task.id))) {
				storage.register(String(task.id), node_path.join(TaskFolder.BUNDLES, String(task.id) + ".json"), { ...task });
			}
			// task counts reached its limit
			if (this.max_threads <= Object.values(worker.get()).filter(($task) => { return $task.status === TaskStatus.WORKING; }).length) {
				update("status", TaskStatus.QUEUED);
				return destroy();
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
				return destroy();
			}
			// update
			update("status", TaskStatus.WORKING);
			update("working", task.finished);
			// download recursivly
			return spawn(0);
		});
	}
	public delete(id: number) {
		return new Promise<void>((resolve, reject) => {
			// remove storage
			storage.un_register(String(id));
			// remove directory
			node_fs.rmdirSync(node_path.join(TaskFolder.DOWNLOADS, String(id)), { recursive: true });
			// remove worker
			worker.set(id, undefined);
			// resolve
			return resolve();
		});
	}
	public evaluate(url: string) {
		return new Promise<Task>((resolve, reject) => {
			for (const schema of scheme) {
				if (new RegExp(schema).test(url)) {
					return read.script(Number(/([0-9]+).html$/.exec(url)![1])).then((script) => {
						return resolve(
							new Task(url, script.title, script.files.map((value, index) => {
								return new TaskFile(value.url, node_path.join(TaskFolder.DOWNLOADS, String(script.id), `${index}.${value.url.split(/\./).pop()}`));
							}), { headers: { "referer": "https://hitomi.la" } }, Number(script.id))
						);
					});
				}
				return reject();
			}
		});
	}
}
export default (new Download(settings.get().download.max_threads, settings.get().download.max_working));
