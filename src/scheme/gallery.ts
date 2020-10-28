import hitomi_la from "@/modules/hitomi";

import { GalleryBlock } from "@/modules/hitomi";
import { Override } from "@/typings/override";
import { Scheme, Schema } from "@/scheme";

export type GalleryIterable = Override<GalleryBlock, { files: string[]; }>;

class Gallery extends Schema<number[]> {
	public get(start: number = 0, final: number = NaN): Promise<GalleryIterable[]> {
		return new Promise<GalleryIterable[]>((resolve, rejects) => {
			const block: GalleryIterable[] = [];
			// get number[] in range
			this.$get().slice(start, isNaN(final) ? this.$get().length : final).map((value, index, array) => {
				hitomi_la.read(value).then((gallery) => {
					hitomi_la.files(gallery).then((files) => {
						// define
						block[index] = { ...gallery, files: files };
						// return condition
						if (Object.keys(block).length === array.length) {
							return resolve(block);
						}
					});
				});
			});

		});
	}
	public set(value: Gallery["state"]): void {
		return this.$set(value);
	}
}
export default (new Gallery([], Scheme.GALLERY));
