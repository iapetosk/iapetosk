import * as fs from "fs";
import * as path from "path";

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
export type Loader = {
	start(url: string): Promise<Loaded>;
};
export type Loaded = {
	readonly title: string,
	readonly links: string[],
	readonly options?: PartialOptions,
	readonly placeholders?: Record<string, any>;
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
export class Thread {
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
					// read thread from .json
					storage.register(file.split(/\./)[0], path.join(Folder.BUNDLES, file), "@import");

					const thread: Thread = storage.get_data(file.split(/\./)[0]);

					switch (thread.status) {
						case Status.NONE:
						case Status.WORKING: {
							this.create(thread);
							break;
						}
						default: {
							worker.set(thread.id, thread);
							break;
						}
					}
				}
			}
		} catch {
			// TODO: none
		}
	}
	public create(thread: Thread) {
		return new Promise<void>((resolve, rejects) => {
			// debug
			console.log(thread);
			
			const state = {
				EXIT: false
			};
			const files: number[] = [
				// TODO: none
			];

			// update thread
			worker.set(thread.id, thread);

			listener.on(Scheme.WORKER, ($index: number, $new: Thread | undefined) => {
				if ($index === thread.id && !$new) {
					state.EXIT = true;
					fs.rmdir(path.join(Folder.DOWNLOADS, String(thread.id)), { recursive: true }, () => {
						// TODO: none
					});
				}
			});
			function next(I: Download) {
				for (const queued of worker.filter({ key: "status", value: Status.QUEUED })) {
					I.create(queued);
				}
				return resolve();
			}
			function update(I: Download, key: "id" | "from" | "title" | "files" | "status" | "options" | "working" | "finished", value: any) {
				switch (state.EXIT) {
					case true: {
						return next(I);
					}
					case false: {
						// update thread
						thread = { ...thread, [key]: value as never };
						// update worker
						worker.set(thread.id, thread);
						// update storage
						storage.set_data(String(thread.id), thread);
						break;
					}
				}
			}
			function condition(I: Download) {
				return !!files[thread.working] && thread.working - thread.finished < I.max_working;
			}
			function recursive(I: Download, index: number): void {
				if (thread.status !== Status.WORKING) {
					return next(I);
				}
				update(I, "working", thread.working + 1);
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
				request.get(
					thread.files[files[index]].url,
					{
						...thread.options,
						headers: {
							...thread.options.headers,
							// resume from partitally downloaded chunk
							...thread.files[files[index]].written ? { "content-range": `bytes=${thread.files[files[index]].written}-` } : {}
						}
					},
					thread.files[files[index]]
				).then(() => {
					if (thread.status !== Status.WORKING) {
						return next(I);
					}
					update(I, "finished", thread.finished + 1);

					if (files.length === thread.finished) {
						update(I, "status", Status.FINISHED);
						return next(I);
					}
					if (condition(I)) {
						return recursive(I, thread.working);
					}
				}).catch((error) => {
					// TODO: handle error
				});
				if (condition(I)) {
					return recursive(I, thread.working);
				}
			}
			// maximum thread exceeded
			if (this.max_threads <= worker.filter({ key: "status", value: Status.WORKING }).length) {
				update(this, "status", Status.QUEUED);
				return resolve();
			}
			// check for incompleted files
			for (let index = 0; index < thread.files.length; index++) {
				if (thread.files[index].written !== thread.files[index].size) {
					files.push(index);
				}
			}
			// thread files are downloaded
			if (!files.length) {
				update(this, "status", Status.FINISHED);
				return resolve();
			}
			// register storage
			if (!storage.exist(String(thread.id))) {
				storage.register(String(thread.id), path.join(Folder.BUNDLES, String(thread.id) + ".json"), thread);
			}
			// update status
			update(this, "status", Status.WORKING);
			// recursivly download
			return recursive(this, 0);
		});
	}
	public remove(id: number) {
		return new Promise<void>((resolve, rejects) => {
			try {
				// remove worker
				worker.set(id, undefined);
				// remove storage
				storage.un_register(String(id));
				fs.rmdir(path.join(Folder.DOWNLOADS, String(id)), { recursive: true }, () => {
					return resolve();
				});
			} catch {
				// TODO: none
			}
		});
	}
	public evaluate(url: string) {
		return new Promise<Thread>((resolve, rejects) => {
			for (const RegExp of [/^https?:\/\/hitomi.la\/galleries\/([\d]+).html$/, /^https?:\/\/hitomi.la\/(reader|manga|doujinshi|gamecg|cg)\/([\D\d]+)-([\D\d]+)-([\d]+).html$/]) {
				switch (RegExp.test(url)) {
					case true: {
						return read.script(Number(/([0-9]+).html$/.exec(url)![1])).then((script) => {
							return resolve(
								new Thread(url, script.title, script.files.map((value, index) => {
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
						return rejects();
					}
				}
			}
		});
	}
}
export default (new Download(5, 5));
