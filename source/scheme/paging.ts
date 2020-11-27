import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

export type Pagination = Record<"metre" | "index" | "size", number>;

class Paging extends Schema<Pagination> {
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
export default (new Paging({ metre: 0, index: 0, size: 0 }, Scheme.PAGING));
