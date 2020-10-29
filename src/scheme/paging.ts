import { Scheme, Schema } from "@/scheme";

class Paging extends Schema<number> {
	public get(): Paging["state"] {
		return this.$get();
	}
	public set(value: Paging["state"]): void {
		return this.$set(value);
	}
	public forward(): void {
		return this.set(this.get() + 1);
	}
	public backward(): void {
		return this.set(this.get() - 1);
	}
}
export default (new Paging(0, Scheme.PAGING));
