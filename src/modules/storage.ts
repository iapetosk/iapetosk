import * as Fs from "fs";

import Utility from "@/modules/utility";

export enum StoragePreset {
	SETTINGS = "settings"
};
export type StorageState = {
	path: string,
	data: any;
};
class Storage {
	private static container: (
		Record<string, StorageState>
	) = {};
	constructor(storage: typeof Storage.container) {
		Storage.container = storage;
	}
	private define(object: Record<string, any>, array: string[], data: any): any {
		for (const [index, value] of array.entries()) {
			if (index === array.length - 1) {
				object[value] = data;
				return;
			} else if (typeof object[value] === "undefined") {
				object[value] = {};
			}
			object = object[value];
		}
	}
	private delete(object: Record<string, any>, array: string[]): any {
		for (const [index, value] of array.entries()) {
			if (index === array.length - 1) {
				delete object[value];
				return;
			} else if (typeof object[value] === "undefined") {
				return;
			}
			object = object[value];
		}
	}
	private return(object: Record<string, any>, array: string[]): any {
		for (const [index, value] of array.entries()) {
			if (index === array.length - 1) {
				return object[value];
			} else if (typeof object[value] === "undefined") {
				return;
			}
			object = object[value];
		}
	}
	public get_path(key: string): StorageState["path"] {
		return this.return(Storage.container, [...key.split(/\./g), "path"]);
	}
	public set_path(key: string, path: StorageState["path"]): void {
		this.define(Storage.container, [...key.split(/\./g), "path"], path);
		this.export(key);
	}
	public get_data(key: string): StorageState["data"] {
		return this.return(Storage.container, [...key.split(/\./g), "data"]);
	}
	public set_data(key: string, data: StorageState["data"]): void {
		this.define(Storage.container, [...key.split(/\./g), "data"], data);
		this.export(key);
	}
	public register(key: string, path: StorageState["path"], data: StorageState["data"]): void {
		this.define(Storage.container, [...key.split(/\./g)], {
			path: path,
			data: data === "@import" ? this.import(path) : {}
		});
		this.export(key);
	}
	public un_register(key: string): void {
		Fs.unlinkSync(this.get_path(key));
		this.delete(Storage.container, [...key.split(/\./g)]);
	}
	public import(key: string): any {
		try {
			return JSON.parse(Fs.readFileSync(this.get_path(key) || key, "utf8"));
		} catch {
			return undefined;
		}
	}
	public export(key: string): void {
		Utility.write(this.get_path(key), JSON.stringify(this.get_data(key)));
	}
	public exist(key: string): boolean {
		return !!this.return(Storage.container, [...key.split(/\./g)]);
	}
}
export default (new Storage({
	[StoragePreset.SETTINGS]: {
		path: "./settings.json",
		data: "@import"
	}
}));
