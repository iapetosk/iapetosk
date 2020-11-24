import * as fs from "fs";
import * as path from "path";

export enum StoragePreset {
	SETTINGS = "settings"
};
export type StorageState = {
	path: string,
	data: any;
};
class Storage {
	private container: (
		Record<string, StorageState>
	) = {};
	constructor(storage: Storage["container"]) {
		this.container = storage;
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
		return this.return(this.container, [...key.split(/\./), "path"]);
	}
	public set_path(key: string, path: StorageState["path"]): void {
		this.define(this.container, [...key.split(/\./), "path"], path);
		this.export(key);
	}
	public get_data(key: string): StorageState["data"] {
		return this.return(this.container, [...key.split(/\./), "data"]);
	}
	public set_data(key: string, data: StorageState["data"]): void {
		this.define(this.container, [...key.split(/\./), "data"], data);
		this.export(key);
	}
	public register(key: string, path: StorageState["path"], data: StorageState["data"]): void {
		this.define(this.container, [...key.split(/\./)], {
			path: path,
			data: data === "@import" ? this.import(path) : {}
		});
		this.export(key);
	}
	public un_register(key: string): void {
		fs.unlinkSync(this.get_path(key));
		this.delete(this.container, [...key.split(/\./)]);
	}
	public import(key: string): any {
		try {
			return JSON.parse(fs.readFileSync(this.get_path(key) || key, "utf8"));
		} catch {
			return undefined;
		}
	}
	public export(key: string): void {
		fs.mkdirSync(path.dirname(this.get_path(key)), { recursive: true });
		fs.writeFileSync(this.get_path(key), JSON.stringify(this.get_data(key)));
	}
	public exist(key: string): boolean {
		return !!this.return(this.container, [...key.split(/\./)]);
	}
}
export default (new Storage({
	[StoragePreset.SETTINGS]: {
		path: "./settings.json",
		data: "@import"
	}
}));
