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
	QUEUED,
	PAUSED,
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
export type PlaceHolders = (
	Record<string, any>
);
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
	public max_threads: number;
	public max_working: number;
	constructor(max_threads: number, max_working: number) {
		// <START>
		this.max_threads = max_threads;
		this.max_working = max_working;
		// <END>
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
	public create(thread: Thread): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {
			// debug
			console.log(thread);

			const I: Download = this;
			const valid: number[] = [];

			// declare thread
			worker.index("threads").declare(thread.id, thread);

			function next(): void {
				worker.index("threads").get(Status.QUEUED).every((value, index) => {
					if (index) {
						return resolve();
					}
					I.create(value);
				});
				return resolve();
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
							...thread.options.headers,
							// resume from partitally downloaded chunk
							...thread.files[valid[index]].written ? { "content-range": `bytes=${thread.files[valid[index]].written}-` } : {}
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
	public remove(id: number): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {
			for (const file of worker.index("threads").get(id)[0]?.files) {
				fs.unlink(file.path, (error) => {
					if (error) {
						// print ERROR
						console.log(error);
						// reject ERROR
						return rejects(error);
					}
				});
			}
			// update worker
			worker.index("threads").declare(id, undefined);
			// update storage
			storage.un_register(id.toString());

			return resolve();
		});
	}
	public evaluate(link: string): Promise<Thread> {
		return new Promise<Thread>((resolve, rejects): void => {
			for (const LOADER of Object.keys(API)) {
				for (const TEST of API[LOADER as never]["regular-expression"] as string[]) {
					if (new RegExp(TEST).test(link)) {
						(require(`@/assets/loaders/${LOADER}`).default as Loader).start(link).then((callback): void => {
							if (callback.links.length) {
								const files: File[] = [];
								const folder: string = Date.now().toString();

								callback.links.forEach((link, $index) => {
									files[$index] = new File(link, path.join(Folder.DOWNLOADS, LOADER, folder, `${$index}${path.extname(link)}`));
								});
								return resolve(new Thread(link, callback.title, files, callback.options));
							}
							throw new Error("empty");
						}).catch((error): void => {
							fs.writeFile(path.join(Folder.DEBUGS, `${Date.now()}.log`), JSON.stringify({ from: link, loader: LOADER, error: error }), (error) => {
								if (error) {
									// print ERROR
									console.log(error);
									// reject ERROR
									return rejects(error);
								}
							});
						});
					}
				}
			}
		});
	}
}
export default (new Download(10, 10));
