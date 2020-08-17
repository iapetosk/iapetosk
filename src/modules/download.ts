import * as fs from "fs";
import * as path from "path";
import storage from "@/modules/storage";
import request, { PartialOptions } from "@/modules/request";
import * as API from "@/assets/modules.json";
import $store from "@/renderer/store/index";
export enum Folder {
	DEBUGS = "debugs",
	BUNDLES = "bundles",
	DOWNLOADS = "downloads"
};
export enum Status {
	NONE,
	PROGRESS,
	FINISHED,
	REMOVED,
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
	public written: boolean;
	constructor(link: string, path: string, written: boolean = false) {
		this.link = link;
		this.path = path;
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
	public yields: number = 0;
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
	public max_yields: number;
	constructor(max_threads: number, max_yields: number) {
		this.max_threads = max_threads;
		this.max_yields = max_yields;
		// limit max threads
		this.threads = new Array(max_threads);
		this.queued = new Array();
		// loop all within folder
		try {
			for (const bundle of fs.readdirSync(Folder.BUNDLES)) {
				if (fs.statSync(path.join(Folder.BUNDLES, bundle)).isFile() && path.extname(bundle) === ".json") {
					const ID: string = bundle.split(/\./)[0];

					storage.register(ID, path.join(Folder.BUNDLES, bundle), "@import");

					const thread: Thread = storage.get_data(ID);

					switch (thread.status) {
						case Status.PROGRESS: {
							this.start(thread);
							break;
						}
						default: {
							$store.dispatch("thread/append", {
								value: thread
							});
							break;
						}
					}
				}
			}
		} catch { }
	}
	public start(thread: Thread): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {
			let slot: number = NaN;

			console.table(thread);

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

			$store.dispatch("thread/append", {
				value: thread
			});

			this.threads[slot] = thread;

			const valid: number[] = [];

			for (let index: number = 0; index < thread.files.length; index++) {
				if (!thread.files[index].written) {
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
			const I: Download = this;
			function condition(): boolean {
				return !!valid[thread.yields] && thread.yields - thread.finished < I.max_yields;
			}
			function recursive(index: number): void {
				if (!thread) {
					return resolve();
				}
				thread.yields++;
				request.get(thread.files[valid[index]].link, thread.options, thread.files[valid[index]].path).then((): void => {
					if (!thread) {
						return resolve();
					}
					thread.finished++;
					thread.files[valid[index]].written = true;
					thread.status = I.status(thread.files);

					storage.set_data(thread.id.toString(), thread);

					$store.dispatch("thread/update", {
						value: thread,
						id: thread.id
					});
					// (files.length - valid.length + thread.finished) / files.length

					if (valid.length === thread.finished) {

						delete I.threads[slot];

						if (I.queued.length) {
							const queue = I.queued[0];
							I.queued.splice(0, 1);
							I.start(queue);
						}
						return resolve();
					}
					if (condition()) {
						return recursive(thread.yields);
					}
				});
				if (condition()) {
					return recursive(thread.yields);
				}
			}
			return recursive(0);
		});
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
							files[index] = new File(link, path.join(".", Folder.DOWNLOADS, LOADER.loader, folder, `${index}${path.extname(link)}`), false);
						});
						return resolve(new Thread(link, callback.title, files, callback.options));
					}).catch((error: Error): void => {
						fs.writeFile(path.join(".", Folder.DEBUGS, `${Date.now()}.log`), error.message, () => {
							return rejects(error);
						});
					});
				}
			}
		});
	}
	public status(files: File[]): Status {
		for (const file of files) {
			if (!file.written) {
				return Status.PROGRESS;
			}
		}
		return Status.FINISHED;
	}
}
export default (new Download(10, 10));
