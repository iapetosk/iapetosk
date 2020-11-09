import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

class Scroll extends Schema<{ metre: number, index: number, size: number; }> {
	public get(): Scroll["state"] {
		return this.$get();
	}
	public set(value: Scroll["state"]): void {
		return this.$set({ ...value, index: utility.clamp(value.index, 0, value.size - 1) });
	}
	public first(): void {
		return this.set({ ...this.get(), index: 0 });
	}
	public previous(): void {
		return this.set({ ...this.get(), index: this.get().index - 1 });
	}
	public next(): void {
		return this.set({ ...this.get(), index: this.get().index + 1 });
	}
	public last(): void {
		return this.set({ ...this.get(), index: this.get().size - 1 });
	}
}
export default (new Scroll({ metre: 0, index: 0, size: 0 }, Scheme.SCROLL));
