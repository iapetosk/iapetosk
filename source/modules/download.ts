import * as fs from "fs";
import * as path from "path";
import * as events from "events";

import read from "@/modules/hitomi/read";
import listener from "@/modules/listener";
import storage from "@/modules/storage";
import request from "@/modules/request";
import worker from "@/scheme/worker";

import { Scheme } from "@/scheme";
import { PartialOptions } from "@/modules/request";

export enum Folder {
	DEBUGS = "debugs",
	BUNDLES = "bundles",
	DOWNLOADS = "downloads"
};
export enum Status {
	NONE,
	FINISHED,
	WORKING,
	QUEUED,
	PAUSED,
	ERROR
};
export class File {
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
	public files: File[];
	public status: Status = Status.NONE;
	public options: PartialOptions;
	public working: number = 0;
	public finished: number = 0;
	constructor(from: string, title: string, files: File[], options: PartialOptions = {}, id: number = Date.now()) {
		this.id = id;
		this.from = from;
		this.title = title;
		this.files = files;
		this.options = options;
	}
}
export class Download {
	public max_threads: number;
	public max_working: number;
	constructor(max_threads: number, max_working: number) {
		this.max_threads = max_threads;
		this.max_working = max_working;
		// exception occured if folder isn't exist
		try {
			for (const file of fs.readdirSync(Folder.BUNDLES)) {
				// check if file is .json
				if (fs.statSync(path.join(Folder.BUNDLES, file)).isFile() && path.extname(file) === ".json") {
					// read task from .json
					storage.register(file.split(/\./)[0], path.join(Folder.BUNDLES, file), "@import");

					const task: Task = storage.get_data(file.split(/\./)[0]);

					switch (task.status) {
						case Status.NONE:
						case Status.WORKING: {
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
		} catch {
			// TODO: none
		}
	}
	public create(task: Task) {
		const observe = new events.EventEmitter, files: number[] = [];
		return new Promise<void>((resolve, reject) => {
			function update(key: "id" | "from" | "title" | "files" | "status" | "options" | "working" | "finished", value: any) {
				if (storage.get_data(String(task.id))) {
					// update task
					task = { ...task, [key]: value as never };
					// update worker
					worker.set(task.id, task);
					// update storage
					storage.set_data(String(task.id), task);
				}
			}
			observe.on("start", (index: number) => {
				if (task.status !== Status.WORKING) {
					return observe.emit("end");
				}
				update("working", task.working + 1);
				request.get(task.files[files[index]].url, { ...task.options, headers: { ...task.options.headers, ...task.files[files[index]].written ? { "content-range": `bytes=${task.files[files[index]].written}-` } : {} } }, task.files[files[index]]).then(() => {
					if (task.status !== Status.WORKING) {
						return observe.emit("end");
					}
					update("finished", task.finished + 1);

					if (!!files[task.working] && task.working - task.finished < this.max_working) {
						return observe.emit("start", task.working);
					}
					if (task.finished === files.length) {
						update("status", Status.FINISHED);
						return observe.emit("end");
					}
				});
				if (!!files[task.working] && task.working - task.finished < this.max_working) {
					return observe.emit("start", task.working);
				}
			});
			observe.on("end", () => {
				for (const queued of worker.filter({ key: "status", value: Status.QUEUED })) {
					this.create(queued);
					break;
				}
				return resolve();
			});
			listener.on(Scheme.WORKER, ($index: number, $new: Task | undefined, $old: Task | undefined) => {
				if ($index === task.id && !$new) {
					// remove listeners
					observe.removeAllListeners();
					// remove
					this.remove(task.id);
				}
			});
			// task counts reached its limit
			if (this.max_threads <= worker.filter({ key: "status", value: Status.WORKING }).length) {
				update("status", Status.QUEUED);
				return observe.emit("end");
			}
			// scan unfinished files
			for (let index = 0; index < task.files.length; index++) {
				if (task.files[index].written !== task.files[index].size) {
					files.push(index);
				}
			}
			// task is finished
			if (!files.length) {
				update("status", Status.FINISHED);
				return observe.emit("end");
			}
			// register storage
			if (!storage.exist(String(task.id))) {
				storage.register(String(task.id), path.join(Folder.BUNDLES, String(task.id) + ".json"), task);
			}
			// update status
			update("status", Status.WORKING);
			// download recursivly
			return observe.emit("start", 0);
		});
	}
	public remove(id: number) {
		return new Promise<void>((resolve, reject) => {
			// remove worker
			worker.set(id, undefined);
			// remove storage
			storage.un_register(String(id));
			fs.rmdir(path.join(Folder.DOWNLOADS, String(id)), { recursive: true }, () => {
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
									return new File(value.url, path.join(Folder.DOWNLOADS, String(script.id), `${index}.${value.url.split(/\./).pop()}`));
								}), {
									headers: {
										"referer": "https://hitomi.la"
									}
								}, script.id)
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
export default (new Download(5, 5));
