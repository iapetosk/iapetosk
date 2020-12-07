import query from "@/scheme/query";
import filter from "@/modules/hitomi/filter";

import { Scheme, Schema } from "@/scheme";
import { Keyword } from "@/modules/hitomi/filter";

export type Session = {
	filter: Keyword,
	index: number;
};

class History extends Schema<{ history: Session[], index: number; }> {
	public get_session() {
		return this.$get().history[this.$get().index];
	}
	public set_session(value: Session) {
		this.$set({ history: [...this.$get().history.slice(0, this.$get().index + 1), value], index: this.$get().history.length });
	}
	public forward() {
		this.$set({ ...this.$get(), index: this.$get().index + 1 });
	}
	public backward() {
		this.$set({ ...this.$get(), index: this.$get().index - 1 });
	}
}
export default (new History({ history: [{ filter: filter.get(query.get()), index: 0 }], index: 0 }, Scheme.HISTORY));
