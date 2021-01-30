import * as node_fs from "fs";
import * as node_path from "path";

import { BridgeEvent } from "@/common";

export enum StoragePreset {
	SETTINGS = "settings"
};
export type StorageState = {
	path: string,
	data: Record<string, string | boolean | number | object> | "@import";
};
class Storage {
	private container: Record<string, StorageState> = {};
	constructor(storage: Storage["container"]) {
		for (const key of Object.keys(storage)) {
			this.register(key, storage[key].path, storage[key].data);
		}
		// before close
		window.bridge.on(BridgeEvent.BEFORE_CLOSE, () => {
			// save all
			this.save();
			// upvote
			window.bridge.emit(BridgeEvent.CLOSE, (["storage"]));
		});
		// every ~ ms
		setInterval(() => {
			// save all
			this.save();
		}, 1000 * 60 * 5);
	}
	private define(object: Record<string, any>, array: string[], data: any) {
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
	private delete(object: Record<string, any>, array: string[]) {
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
	private return(object: Record<string, any>, array: string[]) {
		for (const [index, value] of array.entries()) {
			if (index === array.length - 1) {
				return object[value];
			} else if (typeof object[value] === "undefined") {
				return;
			}
			object = object[value];
		}
	}
	public get_path(key: string) {
		return this.return(this.container, [...key.split(/\./), "path"]);
	}
	public set_path(key: string, path: StorageState["path"]) {
		this.define(this.container, [...key.split(/\./), "path"], path);
	}
	public get_data(key: string) {
		return this.return(this.container, [...key.split(/\./), "data"]);
	}
	public set_data(key: string, data: StorageState["data"]) {
		this.define(this.container, [...key.split(/\./), "data"], data);
	}
	public register(key: string, path: StorageState["path"], data: StorageState["data"]) {
		this.define(this.container, [...key.split(/\./)], {
			path: path,
			data: data === "@import" ? this.import(path) : {}
		});
		this.export(key);
	}
	public un_register(key: string) {
		node_fs.unlinkSync(this.get_path(key));
		this.delete(this.container, [...key.split(/\./)]);
	}
	private import(key_or_path: string) {
		try {
			return JSON.parse(node_fs.readFileSync(this.get_path(key_or_path) || key_or_path, "utf-8"));
		} catch {
			return {} as StorageState["data"];
		}
	}
	private export(key: string) {
		node_fs.mkdirSync(node_path.dirname(this.get_path(key)), { recursive: true });
		node_fs.writeFileSync(this.get_path(key), JSON.stringify(this.get_data(key)));
	}
	public exist(key: string) {
		return Boolean(this.return(this.container, [...key.split(/\./)]));
	}
	public save() {
		for (const key of Object.keys(this.container)) {
			this.export(key);
		}
	}
}
export default (new Storage({
	[StoragePreset.SETTINGS]: {
		path: "./settings.json",
		data: "@import"
	}
}));
