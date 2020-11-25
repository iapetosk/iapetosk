import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

class Paging extends Schema<{ metre: number, index: number, size: number; }> {
	public get() {
		return this.$get();
	}
	public set(value: Paging["state"]) {
		return this.$set({ ...value, index: utility.clamp(value.index, 0, value.size - 1) });
	}
	public first() {
		return this.set({ ...this.get(), index: 0 });
	}
	public forward() {
		return this.set({ ...this.get(), index: this.get().index + 1 });
	}
	public backward() {
		return this.set({ ...this.get(), index: this.get().index - 1 });
	}
	public last() {
		return this.set({ ...this.get(), index: this.get().size - 1 });
	}
}
export default (new Paging({ metre: 5, index: 0, size: 10 }, Scheme.PAGING));
