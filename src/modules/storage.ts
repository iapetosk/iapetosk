import * as fs from "fs";
import * as path from "path";
class Storage {
	constructor() {
	}
	public $define(object: { [key: string]: any; }, field: string, value: any): void {
		const stream = field.split(/\./);

		for (const key of stream) {
			if (key === stream[stream.length - 1]) { 
				object[key] = value;
				break;
			} else if (typeof object[key] === "undefined") {
				object[key] = {};
			}
			object = object[key];
		}
	}
	public $delete(object: { [key: string]: any; }, field: string): void {
		const stream = field.split(/\./);

		for (const key of stream) {
			if (key === stream[stream.length - 1]) {
				delete object[key];
				break;
			} else if (typeof object[key] === "undefined") {
				break;
			}
			object = object[key];
		}
	}
	public $return(object: { [key: string]: any; }, field: string): any {
		const stream = field.split(/\./);

		for (const key of stream) {
			if (key === stream[stream.length - 1]) {
				return object[key];
			} else if (typeof object[key] === "undefined") {
				return;
			}
			object = object[key];
		}
	}
}
export default (new Storage());
