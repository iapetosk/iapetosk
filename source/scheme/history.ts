
import read from "@/modules/hitomi/read";
import search from "@/modules/hitomi/search";

import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";
import { GalleryBlock } from "@/modules/hitomi/read";
import { SearchQuery } from "@/modules/hitomi/search";

export type Session = {
	filter: SearchQuery,
	index: number;
};

class History extends Schema<{ history: Session[], index: number; }> {
	public get(): Session {
		return this.$get().history[this.$get().index] || { filter: [], index: 0 };
	}
	public set(value: Session) {
		const history = [...this.$get().history.slice(0, this.$get().index), value];

		this.$set({ history: history, index: utility.clamp(this.$get().index + 1, 0, history.length - 1) });
	}
	public forward() {
		return this.$set({ ...this.$get(), index: this.$get().index + 1 });
	}
	public backward() {
		return this.$set({ ...this.$get(), index: this.$get().index - 1 });
	}
	public iterable() {
		return new Promise<GalleryBlock[]>((resolve, rejects) => {
			// size and index only matters if SINGULAR equals true
			search.get(this.get().filter, 25, this.get().index).then((archive) => {
				const array: Array<GalleryBlock> = new Array(Math.min(archive.array.length, 25));
				// loop 25 or less times
				for (let index = 0; index < array.length; index++) {
					read.block(archive.array[index + (archive.singular ? 0 : 25 * this.get().index)]).then((block) => {
						// assign
						array[index] = block;
						// none-async resolve
						if (Object.keys(array).length === array.length) {
							return resolve(array);
						}
					});
				}
			});
		});
	}
}
export default (new History({ history: [], index: 0 }, Scheme.HISTORY));
