import * as fs from "fs";
import * as path from "path";
import * as API from "@/assets/modules.json";
import storage from "@/modules/storage";
import request from "@/modules/request";
import worker from "@/scheme/worker";
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
	PAUSED,
	QUEUED,
	ERROR
}
export type Loader = {
	start(url: string): Promise<Loaded>;
};
export type Loaded = {
	readonly title: string,
	readonly links: string[],
	readonly options?: PartialOptions,
	readonly placeholders?: PlaceHolders;
};
export type PlaceHolders = {
	[key: string]: any;
};
export class File {
	public link: string;
	public path: string;
	public size: number;
	public written: number;
	constructor(link: string, path: string, size: number = NaN, written: number = 0) {
		this.link = link;
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
	public threads: Thread[];
	public queued: Thread[];
	public max_threads: number;
	public max_working: number;
	constructor(max_threads: number, max_working: number) {
		this.max_threads = max_threads;
		this.max_working = max_working;
		// limit max threads
		this.threads = new Array(max_threads);
		this.queued = new Array();
		try {
			for (const bundle of fs.readdirSync(Folder.BUNDLES)) {
				if (fs.statSync(path.join(Folder.BUNDLES, bundle)).isFile() && path.extname(bundle) === ".json") {
					const ID: string = bundle.split(/\./)[0];

					storage.register(ID, path.join(Folder.BUNDLES, bundle), "@import");

					const thread: Thread = storage.get_data(ID);

					switch (thread.status) {
						case Status.WORKING: {
							this.start(thread);
							break;
						}
						default: {
							worker.append(thread);
							break;
						}
					}
				}
			}
		} catch { }
	}
	public start(thread: Thread): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {
			// print thread
			console.table(thread);

			const I: Download = this;
			
			let slot: number = NaN;
			let valid: number[] = [];
			function stop(): void {
				// remove from thread list
				delete I.threads[slot];
				// check if queued threads are exist
				if (I.queued.length) {
					// get the oldest queued thread
					const queue = I.queued[0];
					// shorten the queued list
					I.queued.splice(0, 1);
					// run the oldest thread
					I.start(queue);
				}
				// return
				return resolve();
			}
			function pause(): void {
				// append current thread to queued list
				I.queued.push(thread);
				// stop the worker thread
				return stop();
			}
			function condition(): boolean {
				return !!valid[thread.working] && thread.working - thread.finished < I.max_working;
			}
			function recursive(index: number): void {
				if (!thread) {
					return stop();
				}
				if (thread.status === Status.PAUSED) {
					return pause();
				}
				thread.working++;
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
				request.get(
					thread.files[valid[index]].link,
					{
						...thread.options,
						headers: {
							...thread.options.headers,
							// resume from partitally downloaded chunk
							"content-range": `bytes=${thread.files[valid[index]].written}-`
						}
					},
					thread.files[valid[index]]
				).then((): void => {
					thread.finished++;

					storage.set_data(thread.id.toString(), thread);
					worker.replace(thread, thread.id);

					if (!thread) {
						return stop();
					}
					if (thread.status === Status.PAUSED) {
						return pause();
					}
					if (valid.length === thread.finished) {
						return stop();
					}
					if (condition()) {
						return recursive(thread.working);
					}
				});
				if (condition()) {
					return recursive(thread.working);
				}
			}
			for (let index: number = 0; index < this.max_threads; index++) {
				if (!this.threads[index]) {
					slot = index;
					break;
				}
			}
			if (isNaN(slot)) {
				this.queued.push(thread);
				return resolve();
			}
			worker.append(thread);
			// set thread slot
			this.threads[slot] = thread;
			// check for unfinished files
			for (let index: number = 0; index < thread.files.length; index++) {
				if (thread.files[index].written !== thread.files[index].size) {
					valid.push(index);
				}
			}
			if (!valid.length) {
				delete this.threads[slot];
				return resolve();
			}
			if (!storage.exist(thread.id.toString())) {
				storage.register(thread.id.toString(), path.join(Folder.BUNDLES, thread.id.toString() + ".json"), thread);
			}
			return recursive(0);
		});
	}
	public pause(id: number): void {
		for (let index: number = 0; index < this.threads.length; index++) {
			if (this.threads[index].id === id) {
				this.threads[index].status === Status.PAUSED;
				return;
			}
		}
	}
	public remove(id: number): void {
		for (let index: number = 0; index < this.threads.length; index++) {
			if (this.threads[index].id === id) {
				delete this.threads[index];
				return;
			}
		}
	}
	public modulator(link: string): Promise<Thread> {
		return new Promise<Thread>((resolve, rejects): void => {
			for (const LOADER of API) {
				if (new RegExp(LOADER.test).test(link)) {
					// require("module")._load(LOADER.loader, this, false) | https://nearsoft.com/blog/nodejs-how-to-load-a-module-with-require/
					(require(`@/assets/loaders/${LOADER.loader}`).default as Loader).start(link).then((callback): void => {
						const files: File[] = [];
						const folder: string = Date.now().toString();
						callback.links.forEach((link, index) => {
							files[index] = new File(link, path.join(Folder.DOWNLOADS, LOADER.loader, folder, `${index}${path.extname(link)}`));
						});
						return resolve(new Thread(link, callback.title, files, callback.options));
					}).catch((error: Error): void => {
						fs.writeFile(path.join(Folder.DEBUGS, `${Date.now()}.log`), error.message, () => {
							console.log(error);
							return rejects(error);
						});
					});
				}
			}
		});
	}
	public status(files: File[]): Status {
		for (const file of files) {
			if (file.written !== file.size) {
				return Status.WORKING;
			}
		}
		return Status.FINISHED;
	}
}
export default (new Download(10, 10));
