import { Filter } from "@/modules/hitomi";
import { Scheme, Schema } from "@/scheme";

export type HistoryWritten = {
	filter: Filter;
	index: number;
	size: number;
};

class History extends Schema<HistoryWritten[]> {
	public get(start: number = 0, final: number = NaN): History["state"] {
		return this.$get().slice(start, isNaN(final) ? this.$get().length : final);
	}
	public set(value: History["state"]): void {
		return this.$set(value);
	}
	public write(index: number, history?: HistoryWritten): void {
		
	}
}
export default (new History([], Scheme.HISTORY));
