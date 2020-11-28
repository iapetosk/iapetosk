import request from "@/modules/request";

import { RequestResponse } from "@/modules/request";
import { Prefix, Tag, Keyword } from "@/modules/hitomi/filter";

export type GalleryList = {
	size: number,
	array: number[],
	singular: boolean;
};

class Search {
	private index_all = "https://ltn.hitomi.la/index-all.nozomi";
	private collection: Record<string, number[]> = {};
	constructor() {
		// TODO: none
	}
	public get(filter: Keyword, size: number, index: number) {
		return this.unknown_0(filter, size, index);
	}
	public unknown_0(filter: Keyword, size: number, index: number) {
		// array of gallery IDs
		let IDs: number[] = [];
		// length of gallery IDs
		let SIZE: number = 0;
		// request counts
		let COUNT: number = 0;
		// request adresses
		let URLs: Record<Prefix, string[]> = {
			[Prefix.POSITIVE]: [],
			[Prefix.NEGATIVE]: []
		};
		return new Promise<GalleryList>((resolve, rejects) => {
			for (const tag of Object.keys(filter)) {
				switch (tag) {
					case "language": {
						if (Object.values(filter).map((value) => { return value.length; }).reduce(($old, $new) => { return $old + $new; }, 0) - filter.language.length > 0) {
							break;
						}
						for (let index = 0; index < filter[tag as Tag].length; index++) {
							URLs[filter[tag as Tag][index].prefix].push(`https://ltn.hitomi.la/index-${filter[tag as Tag][index].value}.nozomi`);
						}
						break;
					}
					default: {
						for (let index = 0; index < filter[tag as Tag].length; index++) {
							for (const language of filter.language.length ? filter.language : [{ prefix: Prefix.POSITIVE, value: "all" }]) {
								URLs[filter[tag as Tag][index].prefix].push(`https://ltn.hitomi.la/${tag === "male" || tag === "female" ? "tag" : tag}/${tag === "male" || tag === "female" ? `${tag}:${filter[tag as Tag][index].value}` : filter[tag as Tag][index].value}-${filter[tag as Tag][index].prefix === Prefix.POSITIVE && language.prefix === Prefix.POSITIVE ? language.value : "all"}.nozomi`);
							}
						}
						break;
					}
				}
			}
			if (URLs[Prefix.POSITIVE].length === 0) {
				URLs[Prefix.POSITIVE].unshift(this.index_all);
			}

			console.log(URLs);

			const SINGULAR: boolean = URLs[Prefix.POSITIVE].length === 1 && URLs[Prefix.NEGATIVE].length === 0 && URLs[Prefix.POSITIVE][0] === this.index_all;

			function $(prefix: Prefix, array: number[]) {
				const collection: Set<number> = new Set(array);
				// increase slot
				COUNT++;
				// determine prefix
				switch (prefix) {
					case Prefix.POSITIVE: {
						if (IDs.length) {
							const LENGTH: number = IDs.length;
							IDs = IDs.filter((id) => collection.has(id));
							SIZE -= SINGULAR ? LENGTH - IDs.length : 0;
						} else {
							IDs = array;
						}
						break;
					}
					case Prefix.NEGATIVE: {
						IDs = IDs.filter((id) => !collection.has(id));
						break;
					}
				}
				// none-async resolve
				if (COUNT === URLs[Prefix.POSITIVE].length + URLs[Prefix.NEGATIVE].length) {
					// debug
					console.table({
						positive: URLs[Prefix.POSITIVE],
						negative: URLs[Prefix.NEGATIVE],
						singular: SINGULAR
					});
					// return
					return resolve({
						size: SIZE + (SINGULAR ? 0 : IDs.length),
						array: IDs,
						singular: SINGULAR
					});
				}
			};
			for (let $index = 0; $index < URLs[Prefix.POSITIVE].length + URLs[Prefix.NEGATIVE].length; $index++) {
				const shortcut: {
					prefix: Prefix,
					url: string;
				} = {
					prefix: Prefix.POSITIVE,
					url: [...URLs[Prefix.POSITIVE], ...URLs[Prefix.NEGATIVE]][$index]
				};

				if (SINGULAR || !this.collection[shortcut.url]) {
					request.get(shortcut.url, { encoding: "binary", headers: SINGULAR ? { "range": `bytes=${index * size * 4}-${index * size * 4 + size * 4 - 1}` } : {} }).then((callback) => {
						switch (callback.status.code) {
							case 200:
							case 206: {
								const array = this.unknown_1(callback);
								// if only INDEX_ALL assigned
								if (SINGULAR) {
									SIZE += Number((callback.headers["content-range"]! as string).replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
								} else {
									this.collection[shortcut.url] = array;
								}
								$(shortcut.prefix, array);
								break;
							}
						}
					});
				} else {
					$(shortcut.prefix, this.collection[shortcut.url]);
				}
			}
		});
	}
	private unknown_1(response: RequestResponse) {
		const binary: Buffer = new Buffer(response.encode, "binary");
		const endian: DataView = new DataView(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength));
		const array: Array<number> = new Array(endian.byteLength / 4);

		for (let index = 0; index < endian.byteLength / 4; index++) {
			array[index] = endian.getInt32(index * 4, false);
		}
		return array;
	}
}
export default (new Search());
