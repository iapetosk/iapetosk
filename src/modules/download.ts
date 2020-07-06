import * as fs from "fs";
import request from "@/modules/request";

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
	private _yields: number;
	private _finished: number;
	private _max_yields: number;
	private _files: File[];

	constructor(max_yields: number, files: File[]) {
		this._yields = 0;
		this._finished = 0;
		this._max_yields = max_yields;
		this._files = files;
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
	private threads: Thread[];
	private queued: Thread[];
	private max_threads: number;
	private max_yields: number;
	constructor(max_threads: number, max_yields: number) {
		this.max_threads = max_threads;
		this.max_yields = max_yields;
		// limit max threads
		this.threads = new Array(max_threads);
		this.queued = new Array();
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
	public start(files: File[]): Promise<Status | number> {
		return new Promise<Status | number>((resolve, rejects): void => {
			let slot: number = NaN;

			for (let index: number = 0; index < this.max_threads; index++) {
				if (!this.threads[index]) {
					slot = index;
					break;
				}
			}
			if (slot === NaN) {
				// TODO: queue process
				return resolve(Status.QUEUED);
			}
			// create a thread
			this.threads[slot] = new Thread(this.max_yields, files);
			// create valid pool
			const valid: number[] = [];
			// loop each file
			for (let index: number = 0; index < files.length; index++) {
				// add to valid pool if file isnt written
				if (!files[index].written) {
					valid.push(index);
				}
			}
			if (!valid.length) {
				delete this.threads[slot];
				return resolve(Status.FINISHED);
			}
			const I = this;
			function condition(): boolean {
				// yields - finished = current number of on-going requests
				return !!valid[I.threads[slot].yields] && I.threads[slot].yields - I.threads[slot].finished < I.threads[slot].max_yields;
			}
			function recursive(index: number): void {
				// check if thread is destoryed
				if (!I.threads[slot]) {
					return resolve(Status.REMOVED);
				}
				// yields increasement
				I.threads[slot].yields++;
				// @ts-ignore
				request.get(files[valid[index]].link).then((callback): void => {
					// check if thread is destoryed
					if (!I.threads[slot]) {
						return resolve(Status.REMOVED);
					}
					// write file
					fs.writeFile(files[valid[index]].path, callback.body, () => {
						// finished increasement
						I.threads[slot].finished++;
						// file is written
						I.threads[slot].files[valid[index]].written = true;
						// update progress
						resolve((files.length - valid.length + I.threads[slot].finished) / files.length);
						// return if finished all
						if (valid.length === I.threads[slot].finished) {
							delete I.threads[slot];
							return resolve(Status.FINISHED);
						}
						if (condition()) {
							return recursive(I.threads[slot].yields);
						}
					});
				});
				if (condition()) {
					return recursive(I.threads[slot].yields);
				}
			}
			return recursive(0);
		});
	}
	public modulator(link: string): Promise<File[]> {
		return new Promise<File[]>((resolve, rejects): void => {
			for (let index: number = 0; index < API.length; index++) {
				if (new RegExp(API[index].test).test(link)) {
					(require(`@/assets/loaders/${API[index].loader}`).default).start(link).then((response: string[]): void => {
						const files: File[] = [];

						for (const url of response) {
							files.push(
								new File(url, [".", Folder.DOWNLOADS, API[index].loader, Date.now().toString(), url.split(".").pop()].join("/"), false)
							);
						}
						// return resolve
						return resolve(files);
					}).catch((error: Error): void => {
						// write error stacktrace
						fs.writeFile([".", Folder.DEBUGS, `${Date.now()}.log`].join("/"), error.message, () => {
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
