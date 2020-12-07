import settings from "@/modules/configure";

import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

export type Pagination = Record<"metre" | "index" | "size", number>;

class Paging extends Schema<Pagination> {
	public get() {
		return this.$get();
	}
	public set(value: Paging["state"]) {
		this.$set({ ...value, index: utility.clamp(value.index, 0, value.size - 1) });
	}
	public first() {
		this.set({ ...this.get(), index: 0 });
	}
	public forward() {
		this.set({ ...this.get(), index: this.get().index + 1 });
	}
	public backward() {
		this.set({ ...this.get(), index: this.get().index - 1 });
	}
	public last() {
		this.set({ ...this.get(), index: this.get().size - 1 });
	}
}
export default (new Paging({ metre: settings.paging.metre, index: 0, size: 0 }, Scheme.PAGING));
