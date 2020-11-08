import { Filter } from "@/modules/hitomi";
import { Scheme, Schema } from "@/scheme";

export type Session = {
	filter: Filter,
	index: number;
};

class History extends Schema<Session[]> {
	public get(index: number): History["state"] {
		return this.$get().slice(index * 25, (index + 1) * 25);
	}
	public set(value: History["state"]): void {
		return this.$set(value);
	}
}
export default (new History([], Scheme.HISTORY));
