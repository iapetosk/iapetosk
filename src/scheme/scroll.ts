import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";

class Scroll extends Schema<{ length: number, index: number, size: number; }> {
	public get() {
		return this.$get();
	}
	public set(value: Scroll["state"]) {
		return this.$set({ ...value, index: utility.clamp(value.index, 0, value.size - 1) });
	}
}
export default (new Scroll({ length: 0, index: 0, size: 0 }, Scheme.SCROLL));
