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
	public parser(value: string, path: string, attribute?: string): string[] | string {
		const array: string[] = [];
		new DOMParser().parseFromString(value, "text/html").querySelectorAll(path).forEach((element, index) => {
			array[index] = attribute ? element.getAttribute(attribute)! : (element as HTMLElement).innerText;
		});
		return this.unwrap(array);
	}
}

export default (new Utility());
