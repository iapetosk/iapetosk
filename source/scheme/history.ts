import filter from "@/modules/hitomi/filter";
import read from "@/modules/hitomi/read";
import search from "@/modules/hitomi/search";

import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";
import { GalleryBlock } from "@/modules/hitomi/read";
import { Term } from "@/modules/hitomi/filter";

export type Session = {
	filter: Term,
	index: number;
};

class History extends Schema<{ history: Session[], index: number; }> {
	public get_session() {
		return this.$get().history[this.$get().index];
	}
	public set_session(value: Session) {
		this.$set({ history: [...this.$get().history.slice(0, this.$get().index), value], index: this.$get().history.length - 1 });
	}
	public forward() {
		return this.$set({ ...this.$get(), index: this.$get().index + 1 });
	}
	public backward() {
		return this.$set({ ...this.$get(), index: this.$get().index - 1 });
	}
	public iterable() {
		const blocks: GalleryBlock[] = [];
		return new Promise<{ blocks: GalleryBlock[], size: number }>((resolve, rejects) => {
			search.get(this.get_session().filter, 25, this.get_session().index).then((archive) => {
				// prevent overflow
				const array_size = Math.min(archive.size - 25 * this.get_session().index, 25);

				for (let index = 0; index < array_size; index++) {
					read.block(archive.array[index + (archive.singular ? 0 : 25 * this.get_session().index)]).then((block) => {
						// assign
						blocks[index] = block;
						// none-async resolve
						if (Object.keys(blocks).length === array_size) {
							return resolve({
								blocks: blocks,
								size: archive.size
							});
						}
					});
				}
			});
		});
	}
}
export default (new History({ history: [{
	filter: filter.get(""),
	index: 0
}], index: 0 }, Scheme.HISTORY));
