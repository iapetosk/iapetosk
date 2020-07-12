class Utility {
	public clamp(value: number, minimum: number, maximum: number): number {
		return Math.min(Math.max(value, minimum), maximum);
	}
	public truncate(value: number): number {
		return value - value % 10;
	}
}

export default (new Utility());
