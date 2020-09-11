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
	NONE = 1,
	FINISHED = 2,
	WORKING = 3,
	QUEUED = 4,
	PAUSED = 5,
	ERROR = 6
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
	public status: Status;
	public options: PartialOptions;
	public working: number = 0;
	public finished: number = 0;
	constructor(from: string, title: string, files: File[], options: PartialOptions = {}, id: number = Date.now()) {
		this.id = id;
		this.from = from;
		this.title = title;
		this.files = files;
		this.status = Status.NONE;
		this.options = options;
	}
}
export class Download {
	public max_threads: number;
	public max_working: number;
	constructor(max_threads: number, max_working: number) {
		// <START>
		this.max_threads = max_threads;
		this.max_working = max_working;
		// <END>
		try {
			for (const bundle of fs.readdirSync(Folder.BUNDLES)) {
				if (fs.statSync(path.join(Folder.BUNDLES, bundle)).isFile() && path.extname(bundle) === ".json") {
					const ID: string = bundle.split(/\./)[0];

					storage.register(ID, path.join(Folder.BUNDLES, bundle), "@import");

					const thread: Thread = storage.get_data(ID);

					switch (thread.status) {
						case Status.NONE:
						case Status.WORKING: {
							this.start(thread);
							break;
						}
						default: {
							worker.index("threads").declare(thread.id, thread);
							break;
						}
					}
				}
			}
		} catch {
			// TODO: none
		}
	}
	public start(thread: Thread): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {

			console.table(thread);

			const I: Download = this;
			const valid: number[] = [];

			// declare thread
			worker.index("threads").declare(thread.id, thread);

			function next(): void {
				worker.index("threads").get(Status.QUEUED).every((value, index) => {
					if (index) {
						return resolve();
					}
					I.start(value);
				});
			}
			function condition(): boolean {
				return !!valid[thread.working] && thread.working - thread.finished < I.max_working;
			}
			function recursive(index: number): void {
				if (!thread) {
					return next();
				}
				if (thread.status !== Status.WORKING) {
					return resolve();
				}
				thread.working++;
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
				request.get(
					thread.files[valid[index]].link,
					{
						...thread.options,
						headers: {
							...thread.options?.headers,
							// resume from partitally downloaded chunk
							"content-range": `bytes=${thread.files[valid[index]].written}-`
						}
					},
					thread.files[valid[index]]
				).then((): void => {
					thread.finished++;

					if (!thread) {
						return next();
					}
					if (valid.length === thread.finished) {
						thread.status = Status.FINISHED;
						return next();
					}
					if (thread.status !== Status.WORKING) {
						return resolve();
					}
					if (condition()) {
						return recursive(thread.working);
					}
				}).catch((error) => {
					// TODO: handle error
				});
				if (condition()) {
					return recursive(thread.working);
				}
			}
			// maximum thread exceeded
			if (this.max_threads <= worker.index("threads").get(Status.WORKING).length) {
				thread.status = Status.QUEUED;
				return resolve();
			}
			for (let index: number = 0; index < thread.files.length; index++) {
				if (thread.files[index].written !== thread.files[index].size) {
					valid.push(index);
				}
			}
			// thread files are downloaded
			if (!valid.length) {
				thread.status = Status.FINISHED;
				return resolve();
			}
			// register storage
			if (!storage.exist(thread.id.toString())) {
				storage.register(thread.id.toString(), path.join(Folder.BUNDLES, thread.id.toString() + ".json"), thread);
			}
			// observe thread
			thread = new Proxy(thread, {
				set(target: Thread, key: never, value: never): boolean {
					// debug
					console.log(target);
					// update property
					target[key] = value;
					// update storage
					storage.set_data(target.id.toString(), target);
					// update worker
					worker.index("threads").declare(target.id, target);
					// approve
					return true;
				}
			});
			// update status
			thread.status = Status.WORKING;
			// recursivly download
			return recursive(0);
		});
	}
	public evaluate(link: string): Promise<Thread> {
		return new Promise<Thread>((resolve, rejects): void => {
			for (const LOADER of API) {
				if (new RegExp(LOADER.test).test(link)) {
					// require("module")._load(LOADER.loader, this, false) | https://nearsoft.com/blog/nodejs-how-to-load-a-module-with-require/
					(require(`@/assets/loaders/${LOADER.loader}`).default as Loader).start(link).then((callback): void => {
						if (callback.links.length) {
							const files: File[] = [];
							const folder: string = Date.now().toString();

							callback.links.forEach((link, index) => {
								files[index] = new File(link, path.join(Folder.DOWNLOADS, LOADER.loader, folder, `${index}${path.extname(link)}`));
							});
							return resolve(new Thread(link, callback.title, files, callback.options));
						}
						throw new Error("empty");
					}).catch((error: Error): void => {
						fs.writeFile(path.join(Folder.DEBUGS, `${Date.now()}.log`), JSON.stringify({ from: link, loader: LOADER, error: error }), () => {
							// print ERROR
							console.log(error);
							// reject ERROR
							return rejects(error);
						});
					});
				}
			}
		});
	}
}
export default (new Download(10, 10));
