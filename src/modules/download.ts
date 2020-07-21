import * as fs from "fs";
import * as path from "path";
import request, { PartialOptions } from "@/modules/request";
import * as API from "@/assets/modules.json";
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
	readonly links: string[],
	readonly options?: PartialOptions,
	readonly placeholders: PlaceHolders;
};
export type PlaceHolders = {
	[key: string]: any;
};
export class File {
	private _link: string;
	private _path: string;
	private _written: boolean;
	constructor(link: string, path: string, written: boolean = false) {
		this._link = link;
		this._path = path;
		this._written = written;
	}
	get link(): string {
		return this._link;
	}
	set link(value: string) {
		if (new RegExp("[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)").test(value)) {
			this._path = value;
		} else {
			throw new SyntaxError("invalid url");
		}
	}
	get path(): string {
		return this._path;
	}
	set path(value: string) {
		if (new RegExp("((?:[^/]*/)*)(.*)").exec(value)?.[2]) {
			this._path = value;
		} else {
			throw new SyntaxError("invalid path");
		}
	}
	get written(): boolean {
		return this._written;
	}
	set written(value: boolean) {
		this._written = value;
	}
}
export class Thread {
	private _id: number;
	private _yields: number;
	private _finished: number;
	private _max_yields: number;
	private _files: File[];
	constructor(max_yields: number, files: File[]) {
		// generate id
		this._id = Date.now();
		// initial setup
		this._yields = 0;
		this._finished = 0;
		// limit max yields
		this._max_yields = max_yields;
		// define files
		this._files = files;
	}
	get id(): number {
		return this._id;
	}
	set id(value: number) {
		this._id = value;
	}
	get yields(): number {
		return this._yields;
	}
	set yields(value: number) {
		this._yields = value;
	}
	get finished(): number {
		return this._finished;
	}
	set finished(value: number) {
		this._finished = value;
	}
	get max_yields(): number {
		return this._max_yields;
	}
	get files(): File[] {
		return this._files;
	}
}
export class Download {
	private _threads: Thread[];
	private _queued: Thread[];
	private _max_threads: number;
	private _max_yields: number;
	constructor(max_threads: number, max_yields: number) {
		this._max_threads = max_threads;
		this._max_yields = max_yields;
		// limit max threads
		this._threads = new Array(max_threads);
		this._queued = new Array();
		/*
		for (const bundle of fs.readdirSync(Folder.BUNDLES)) {
			if (fs.statSync(bundle).isFile() && path.extname(bundle) === ".json") {
				const ID: string = path.basename(bundle);
				database.register(ID, path.join(Folder.BUNDLES, bundle), "[import]");
				switch (database.get_data(ID)) {
					case Status.PROGRESS: {
						this.start(database.get_data(ID));
						break;
					}
				}
			}
		}
		*/
	}
	get threads(): Thread[] {
		return this._threads;
	}
	set threads(value: Thread[]) {
		this._threads = value;
	}
	get queued(): Thread[] {
		return this._queued;
	}
	set queued(value: Thread[]) {
		this._queued = value;
	}
	get max_threads(): number {
		return this._max_threads;
	}
	set max_threads(value: number) {
		this._max_threads = value;
	}
	get max_yields(): number {
		return this._max_yields;
	}
	set max_yields(value: number) {
		this._max_yields = value;
	}
	public start(manifest: Thread | File[], options?: PartialOptions): Promise<{ thread: Thread, status: Status; }> {
		return new Promise<{ thread: Thread, status: Status; }>((resolve, rejects): void => {
			let slot: number = NaN;
			let files: File[] = manifest instanceof Thread ? manifest.files : manifest;
			let thread: Thread = manifest instanceof Thread ? manifest : new Thread(this._max_yields, files);

			console.table(thread);

			for (let index: number = 0; index < this.max_threads; index++) {
				if (!this.threads[index]) {
					slot = index;
					break;
				}
			}
			if (isNaN(slot)) {
				this.queued.push(thread);
				return resolve({ thread: thread, status: Status.QUEUED });
			}

			this.threads[slot] = thread;

			const valid: number[] = [];

			for (let index: number = 0; index < files.length; index++) {
				if (!files[index].written) {
					valid.push(index);
				}
			}
			if (!valid.length) {
				delete this.threads[slot];
				return resolve({ thread: thread, status: Status.FINISHED });
			}
			const I: Download = this;
			function condition(): boolean {
				return !!valid[thread.yields] && thread.yields - thread.finished < thread.max_yields;
			}
			function recursive(index: number): void {
				if (!thread) {
					return resolve({ thread: thread, status: Status.REMOVED });
				}
				thread.yields++;
				request.get(files[valid[index]].link, options, files[valid[index]].path).then((callback): void => {
					if (!thread) {
						return resolve({ thread: thread, status: Status.REMOVED });
					}
					thread.finished++;
					thread.files[valid[index]].written = true;

					// (files.length - valid.length + thread.finished) / files.length
					resolve({ thread: thread, status: Status.PROGRESS });

					if (valid.length === thread.finished) {
						delete I.threads[slot];

						if (I.queued.length) {
							const queue = I.queued[0];
							I.queued.splice(0, 1);
							I.start(queue);
						}
						return resolve({ thread: thread, status: Status.FINISHED });
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
	public modulator(link: string): Promise<{ files: File[], options?: PartialOptions; }> {
		return new Promise<{ files: File[], options?: PartialOptions; }>((resolve, rejects): void => {
			for (const LOADER of API) {
				if (new RegExp(LOADER.test).test(link)) {
					// require("module")._load(LOADER.loader, this, false) | https://nearsoft.com/blog/nodejs-how-to-load-a-module-with-require/
					(require(`@/assets/loaders/${LOADER.loader}`).default as Loader).start(link).then((callback): void => {
						const files: File[] = [];
						const folder: string = Date.now().toString();
						callback.links.forEach((link, index) => {
							files[index] = new File(link, path.join(".", Folder.DOWNLOADS, LOADER.loader, folder, `${index}${path.extname(link)}`), false);
						});
						return resolve({
							files: files,
							options: callback.options
						});
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
			if (file.written) {
				return Status.PROGRESS;
			}
		}
		return Status.FINISHED;
	}
}
export default (new Download(10, 10));
