class Utility {
	public clamp(value: number, minimum: number, maximum: number): number {
		return Math.min(Math.max(value, minimum), maximum);
	}
	public truncate(value: number): number {
		return value - value % 10;
	}
	public random(minimum: number, maximum: number): number {
		return Math.floor(Math.random() * (maximum - minimum + 1.0)) + minimum;
	}
	public minify(value: any[]): any[] | any {
		return value.length - 1.0 ? value : value[0];
	}
}

export default (new Utility());
