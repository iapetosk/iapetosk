class Utility {
	public index_of<type>(array: type[], value: type): number {
		for (let index: number = 0; index < array.length; index++) {
			if (array[index] === value) {
				return index;
			}
		}
		return NaN;
	}
	public clamp(value: number, minimum: number, maximum: number): number {
		return Math.min(Math.max(value, minimum), maximum);
	}
	public truncate(value: number): number {
		return value - value % 10;
	}
	public random(minimum: number, maximum: number): number {
		return Math.floor(Math.random() * (maximum - minimum + 1.0)) + minimum;
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
				return String(capture);
			}
			case "number": {
				return Number(capture);
			}
			case "array": {
				return JSON.parse(`{"capture":${capture}}`).capture;
			}
			case "object": {
				return JSON.parse(capture);
			}
			default: {
				throw new Error();
			}
		}
	}
	public inline(value: { [key: string]: boolean }): string {
		const array: string[] = [];
		
		for (const key in value) {
			if (value[key]) {
				array.push(key);
			}
		}
		return array.join("\u0020");
	}
	public split(text: string, index: number): string[] {
		return [text.substring(0, index), text.substring(index)];
	}
}
export default (new Utility());
