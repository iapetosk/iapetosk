import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

class Paging extends Schema<{ metre: number, index: number, size: number; }> {
	public get(): Paging["state"] {
		return this.$get();
	}
	public set(value: Paging["state"]): void {
		return this.$set({ ...value, index: utility.clamp(value.index, 0, value.size - 1) });
	}
	public first(): void {
		return this.set({ ...this.get(), index: 0 });
	}
	public forward(): void {
		return this.set({ ...this.get(), index: this.get().index + 1 });
	}
	public backward(): void {
		return this.set({ ...this.get(), index: this.get().index - 1 });
	}
	public last(): void {
		return this.set({ ...this.get(), index: this.get().size - 1 });
	}
}
export default (new Paging({ metre: 5, index: 0, size: 10 }, Scheme.PAGING));
