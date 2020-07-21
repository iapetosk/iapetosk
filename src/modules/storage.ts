import * as fs from "fs";
import * as path from "path";
class Storage {
	constructor() {
	}
	public $define(object: { [key: string]: any; }, field: string, value: any): void {
		field.split(".").forEach((key, index, array) => {
			if (key === array[array.length - 1]) {
				object[key] = value;
				return;
			} else if (typeof object[key] === "undefined") {
				object[key] = {};
			}
			object = object[key];
		});
	}
	public $delete(object: { [key: string]: any; }, field: string): void {
		field.split(".").forEach((key, index, array) => {
			if (key === array[array.length - 1]) {
				delete object[key];
				return;
			} else if (typeof object[key] === "undefined") {
				return;
			}
			object = object[key];
		});
	}
	public $return(object: { [key: string]: any; }, field: string): any {
		field.split(".").forEach((key, index, array) => {
			if (key === array[array.length - 1]) {
				return object[key];
			} else if (typeof object[key] === "undefined") {
				return;
			}
			object = object[key];
		});
	}
}
export default (new Storage());
