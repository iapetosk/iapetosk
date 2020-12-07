import settings from "@/modules/configure";

import read from "@/modules/hitomi/read";
import search from "@/modules/hitomi/search";

import { Scheme, Schema } from "@/scheme";
import { Session } from "@/scheme/history";
import { GalleryBlock } from "@/modules/hitomi/read";

class Gallery extends Schema<{ blocks: GalleryBlock[], size: number; }> {
	public get() {
		return this.$get();
	}
	public set(value: Session) {
		// reset
		this.$set({ blocks: [], size: 0 });
		search.get(value.filter, settings.hitomi.per_page, value.index).then(({ array, size, singular }) => {
			// static length
			const blocks: GalleryBlock[] = new Array(Math.min(size - settings.hitomi.per_page * value.index, settings.hitomi.per_page));

			for (let index = 0; index < blocks.length; index++) {
				read.block(array[index + (singular ? 0 : settings.hitomi.per_page * value.index)]).then((block) => {
					// assign
					blocks[index] = block;
					// none-async resolve
					if (Object.keys(blocks).length === blocks.length) {
						// assign
						this.$set({
							blocks: blocks,
							size: size
						});
					}
				});
			}
		});
	}
}
export default (new Gallery({ blocks: [], size: 0 }, Scheme.GALLERY));
