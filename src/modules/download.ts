import * as Fs from "fs";
import * as Path from "path";
import * as API from "@/assets/modules.json";

import Storage from "@/modules/storage";
import Request from "@/modules/request";
import Worker from "@/scheme/worker";

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
		// <define default properties>
		this.max_threads = max_threads;
		this.max_working = max_working;
		// <exception occured if folder isn't exist>
		try {
			for (const file of Fs.readdirSync(Folder.BUNDLES)) {
				// check if file is .json
				if (Fs.statSync(Path.join(Folder.BUNDLES, file)).isFile() && Path.extname(file) === ".json") {
					// read thread from .json
					Storage.register(file.split(/\./)[0], Path.join(Folder.BUNDLES, file), "@import");

					const thread: Thread = Storage.get_data(file.split(/\./)[0]);

					switch (thread.status) {
						case Status.NONE:
						case Status.WORKING: {
							this.create(thread);
							break;
						}
						default: {
							Worker.declare(thread.id, thread);
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
			Worker.declare(thread.id, thread);

			// observe thread
			thread = new Proxy(thread, {
				set(target: Thread, key: never, value: never): boolean {
					// debug
					console.log(target);
					// update property
					target[key] = value;
					// update storage
					Storage.set_data(target.id.toString(), target);
					// update worker
					Worker.declare(target.id, target);
					// approve
					return true;
				}
			});
			function next(): void {
				Worker.get(Status.QUEUED).every((value, index) => {
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
				Request.get(
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
			if (this.max_threads <= Worker.get(Status.WORKING).length) {
				thread.status = Status.QUEUED;
				return resolve();
			}
			// check for incompleted files
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
			if (!Storage.exist(thread.id.toString())) {
				Storage.register(thread.id.toString(), Path.join(Folder.BUNDLES, thread.id.toString() + ".json"), thread);
			}
			// update status
			thread.status = Status.WORKING;
			// recursivly download
			return recursive(0);
		});
	}
	public remove(id: number): Promise<void> {
		return new Promise<void>((resolve, rejects): void => {
			// delete folder with files within
			Fs.rmdirSync(Path.dirname(Worker.get(id)[0]?.files[0].path), { recursive: true });
			// update worker
			Worker.declare(id, undefined);
			// update storage
			Storage.un_register(id.toString());

			return resolve();
		});
	}
	public evaluate(link: string): Promise<Thread> {
		return new Promise<Thread>((resolve, rejects): void => {
			for (const LOADER of Object.keys(API)) {
				for (const TEST of API[LOADER as never] as string[]) {
					if (new RegExp(TEST).test(link)) {
						(require(`@/assets/loaders/${LOADER}`).default as Loader).start(link).then((callback): void => {
							if (callback.links.length) {
								const files: File[] = [];
								const folder: string = Date.now().toString();

								callback.links.forEach((link, $index) => {
									files[$index] = new File(link, Path.join(Folder.DOWNLOADS, LOADER, folder, `${$index}${Path.extname(link)}`));
								});
								return resolve(new Thread(link, callback.title, files, callback.options));
							}
							throw new Error("empty");
						}).catch((error): void => {
							Fs.writeFile(Path.join(Folder.DEBUGS, `${Date.now()}.log`), JSON.stringify({ from: link, loader: LOADER, error: error }), (error) => {
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
