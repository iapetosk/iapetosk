import hitomi from "@/modules/hitomi";
import utility from "@/modules/utility";

import { Scheme, Schema } from "@/scheme";
import { Filter, GalleryIterable } from "@/modules/hitomi";

export type Session = {
	history: {
		filter: Filter,
		index: number;
	}[],
	index: number;
};

class History extends Schema<Session> {
	public get(): { filter: Filter, index: number; } {
		return this.$get().history[this.$get().index] || { filter: [], index: 0 };
	}
	public set(value: { filter: Filter, index: number; }): void {
		const history = [...this.$get().history.slice(0, this.$get().index), value];

		this.$set({ history: history, index: utility.clamp(this.$get().index + 1, 0, history.length - 1) });
	}
	public forward(): void {
		return this.$set({ ...this.$get(), index: this.$get().index + 1 });
	}
	public backward(): void {
		return this.$set({ ...this.$get(), index: this.$get().index - 1 });
	}
	public iterable(): Promise<GalleryIterable[]> {
		// galleryiterable is extends of galleryblock
		const array: GalleryIterable[] = [];
		return new Promise<GalleryIterable[]>((resolve, rejects) => {
			// size and index only matters @if SINGULAR === true
			hitomi.search(this.get().filter, { size: 25, index: this.get().index }).then((archive) => {
				// loop 0~24 => 25 times
				for (let index: number = 0; index < Math.min(archive.array.length, 25); index++) {
					// get galleryblock from id
					hitomi.read(archive.array[index + (archive.singular ? 0 : 25 * this.get().index)]).then((gallery) => {
						// get files from galleryblock
						hitomi.files(gallery).then((files) => {
							// assign to array
							array[index] = { ...gallery, files: files };
							// none-async return
							if (Object.keys(array).length === Math.min(archive.array.length, 25)) {
								return resolve(array);
							}
						});
					});
				}
			});
		});
	}
}
export default (new History({ history: [], index: 0 }, Scheme.HISTORY));
