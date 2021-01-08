class Utility {
	public index_of<type>(value: type[], match: RegExp) {
		for (let index = 0; index < value.length; index++) {
			if (match instanceof RegExp ? match.test(String(value[index])) : value[index] === match) {
				return index;
			}
		}
		return NaN;
	}
	public clamp(value: number, minimum: number, maximum: number) {
		return Math.min(Math.max(value, minimum), maximum);
	}
	public random(minimum: number, maximum: number, type: "integer" | "double" = "integer") {
		switch (type) {
			case "integer": {
				return Math.floor(Math.random() * (maximum - minimum + 1.0)) + minimum;
			}
			case "double": {
				return Math.random() * (maximum - minimum) + minimum;
			}
		}
	}
	public wrap<type>(content: type | type[]) {
		return content instanceof Array ? content : [content];
	}
	public unwrap<type>(value: type[]) {
		return value.length - 1.0 ? value : value[0];
	}
	public parse(value: Document | string, selector: string, attribute?: string) {
		const array: string[] = [];

		(value instanceof Document ? value : new DOMParser().parseFromString(value, "text/html")).querySelectorAll(selector).forEach((element, index) => {
			array[index] = attribute ? element.getAttribute(attribute)! : (element as HTMLElement).innerText;
		});

		return this.unwrap(array);
	}
	public extract(value: string, selector: string, type: "string" | "number" | "array" | "object") {
		const capture: string = new RegExp(`var ${selector} = (.+?)(?=;)`).exec(value)![1];

		switch (type) {
			case "string": {
				return String(/^["'`]([\D\d]*)["'`]$/.exec(capture)![1]);
			}
			case "number": {
				return Number(capture);
			}
			case "array": {
				return String(/^\[([\D\d]*)\]$/.exec(capture)![1]).split(/\,/g);
			}
			case "object": {
				return JSON.parse(capture);
			}
			default: {
				throw new Error();
			}
		}
	}
	public cookie_eat(value: string) {
		const cookie: Record<string, any> = {};

		value.split(/;\s/g).forEach((property) => {
			cookie[property.split(/=/)[0]] = property.split(/=/)[1];
		});
		return cookie;
	}
	public cookie_bake(value: Record<string, any>) {
		const cookie: string[] = [];

		Object.keys(value).forEach((key) => {
			cookie.push(value[key] ? `${key}=${value[key]}` : key);
		});
		return cookie.join(";\u0020");
	}
	public inline(value: Record<string, boolean>) {
		const array: string[] = [];

		for (const key in value) {
			if (value[key]) {
				array.push(key);
			}
		}
		return array.join("\u0020");
	}
	public devide(text: string, index: number): [string, string] {
		return [text.substring(0, index), text.substring(index)];
	}
}
export default (new Utility());
