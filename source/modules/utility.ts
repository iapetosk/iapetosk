import * as fs from "fs";
import * as path from "path";

class Utility {
	public index_of<type>(array: (type | RegExp)[], value: type): number {
		for (let index: number = 0; index < array.length; index++) {
			if (array[index] instanceof RegExp ? (array[index] as RegExp).test(String(value)) : array[index] === value) {
				return index;
			}
		}
		return NaN;
	}
	public clamp(value: number, minimum: number, maximum: number): number {
		return Math.min(Math.max(value, minimum), maximum);
	}
	public random(minimum: number, maximum: number, type: "integer" | "double" = "integer"): number {
		switch (type) {
			case "integer": {
				return Math.floor(Math.random() * (maximum - minimum + 1.0)) + minimum;
			}
			case "double": {
				return Math.random() * (maximum - minimum) + minimum;
			}
		}
	}
	public unwrap<type>(value: type[]): type[] | type {
		return value.length - 1.0 ? value : value[0];
	}
	public parse(value: string, path: string, attribute?: string): string[] | string {
		const array: string[] = [];

		new DOMParser().parseFromString(value, "text/html").querySelectorAll(path).forEach((element, index) => {
			array[index] = attribute ? element.getAttribute(attribute)! : (element as HTMLElement).innerText;
		});

		return this.unwrap(array);
	}
	public extract(value: string, path: string, type: "string" | "number" | "array" | "object"): any {
		const capture: string = new RegExp(`var ${path} = (.+?)(?=;)`).exec(value)![1];

		switch (type) {
			case "string": {
				return String(/^["'`]([\D\d]*)["'`]$/.exec(capture)![1]);
			}
			case "number": {
				return Number(capture);
			}
			case "array": {
				return /^\[([\D\d]*)\]$/.exec(capture)![1].split(/\,/g);
			}
			case "object": {
				return JSON.parse(capture);
			}
			default: {
				throw new Error();
			}
		}
	}
	public cookie_decode(value: string): Record<string, any> {
		const cookie: Record<string, any> = {};

		value.split(/;\s/g).forEach((property) => {
			cookie[property.split(/=/)[0]] = property.split(/=/)[1];
		});
		return cookie;
	}
	public cookie_encode(value: Record<string, any>): string {
		const cookie: string[] = [];

		Object.keys(value).forEach((key) => {
			cookie.push(value[key] ? `${key}=${value[key]}` : key);
		});
		return cookie.join(";\u0020");
	}
	public inline(value: Record<string, boolean>): string {
		const array: string[] = [];

		for (const key in value) {
			if (value[key]) {
				array.push(key);
			}
		}
		return array.join("\u0020");
	}
	public devide(text: string, index: number): string[] {
		return [text.substring(0, index), text.substring(index)];
	}
	public write(directory: string, content: any): void {
		// generates directory recursively
		fs.mkdirSync(path.dirname(directory), { recursive: true });
		// write file
		fs.writeFileSync(directory, content);
	}
}
export default (new Utility());
