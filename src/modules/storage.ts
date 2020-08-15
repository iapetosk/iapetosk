import * as fs from "fs";
import * as path from "path";
export enum StoragePreset {
	SETTINGS = "settings"
}
class Storage {
	private store: {
		[key: string]: {
			path: string,
			data: any
		}
	} = {};
	constructor(store: Storage["store"]) {
		this.store = store;
	}
	public $define(object: { [key: string]: any; }, field: string, data: any): any {
        const array: string[] = field.split(".");

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
	public $delete(object: { [key: string]: any; }, field: string): any {
        const array: string[] = field.split(".");

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
	public $return(object: { [key: string]: any; }, field: string): any {
        const array: string[] = field.split(".");

        for (const [index, value] of array.entries()) {
            if (index === array.length - 1) {
				return object[value];
			} else if (typeof object[value] === "undefined") {
				return;
			}
			object = object[value];
        }
	}
	public get_path(key: string): string {
		return this.$return(this.store, key + ".path");
	}
	public set_path(key: string, path: any): void {
		this.$define(this.store, key + ".path", path);
		this.export(key);
	}
	public get_data(key: string): any {
		return this.$return(this.store, key + ".data");
	}
	public set_data(key: string, data: any): void {
		this.$define(this.store, key + ".data", data);
		this.export(key);
	}
	public register(key: string, path: string, data: any): void {
		this.$define(this.store, key, {
			path: path,
			data: data === "@import" ? this.import(path) : {}
		});
		this.export(key);
	}
	public un_register(key: string): void {
		fs.rmdirSync(path.dirname(this.get_path(key)), { recursive: true });
		this.$delete(this.store, key);
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
		return !!this.$return(this.store, key);
	}
}
export default (new Storage({
	[StoragePreset.SETTINGS]: {
		path: "./settings.json",
		data: "@import"
	}
}));
