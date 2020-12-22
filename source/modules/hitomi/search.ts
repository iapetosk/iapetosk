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
	public get(filter: Keyword, index: number, per_page: number) {
		return this.unknown_0(filter, index, per_page);
	}
	private unknown_0(filter: Keyword, index: number, per_page: number) {
		// array of gallery array
		let array: number[] = [];
		// length of gallery array
		let size: number = 0;
		// request counts
		let count: number = 0;
		// request adresses
		const URL: Record<Prefix, string[]> = {
			[Prefix.POSITIVE]: [],
			[Prefix.NEGATIVE]: []
		};
		return new Promise<GalleryList>((resolve, reject) => {
			for (const tag of Object.keys(filter)) {
				switch (tag) {
					case "language": {
						if (Object.values(filter).map((value) => { return value.length; }).reduce(($old, $new) => { return $old + $new; }, 0) - filter.language.length > 0) {
							break;
						}
						for (let index = 0; index < filter[tag as Tag].length; index++) {
							URL[filter[tag as Tag][index].prefix].push(`https://ltn.hitomi.la/index-${filter[tag as Tag][index].value}.nozomi`);
						}
						break;
					}
					default: {
						for (let index = 0; index < filter[tag as Tag].length; index++) {
							for (const language of filter.language.length ? filter.language : [{ prefix: Prefix.POSITIVE, value: "all" }]) {
								URL[filter[tag as Tag][index].prefix].push(`https://ltn.hitomi.la/${tag === "male" || tag === "female" ? "tag" : tag}/${tag === "male" || tag === "female" ? `${tag}:${filter[tag as Tag][index].value}` : filter[tag as Tag][index].value}-${filter[tag as Tag][index].prefix === Prefix.POSITIVE && language.prefix === Prefix.POSITIVE ? language.value : "all"}.nozomi`);
							}
						}
						break;
					}
				}
			}
			if (URL[Prefix.POSITIVE].length === 0) {
				URL[Prefix.POSITIVE].unshift(this.index_all);
			}
			console.log(URL);

			const SINGULAR: boolean = URL[Prefix.POSITIVE].length === 1 && URL[Prefix.NEGATIVE].length === 0 && URL[Prefix.POSITIVE][0] === this.index_all;

			function $(prefix: Prefix, $array: number[]) {
				const collection: Set<number> = new Set($array);
				// increase slot
				count++;
				// determine prefix
				switch (prefix) {
					case Prefix.POSITIVE: {
						if (array.length) {
							const $size: number = array.length;
							array = array.filter((id) => collection.has(id));
							size -= SINGULAR ? $size - array.length : 0;
						} else {
							array = $array;
						}
						break;
					}
					case Prefix.NEGATIVE: {
						array = array.filter((id) => !collection.has(id));
						break;
					}
				}
				// none-async resolve
				if (count === URL[Prefix.POSITIVE].length + URL[Prefix.NEGATIVE].length) {
					// debug
					console.table({
						positive: URL[Prefix.POSITIVE],
						negative: URL[Prefix.NEGATIVE],
						singular: SINGULAR
					});
					// return
					return resolve({
						size: size + (SINGULAR ? 0 : array.length),
						array: array,
						singular: SINGULAR
					});
				}
			};
			for (let $index = 0; $index < URL[Prefix.POSITIVE].length + URL[Prefix.NEGATIVE].length; $index++) {
				const shortcut = { prefix: $index < URL[Prefix.POSITIVE].length ? Prefix.POSITIVE : Prefix.NEGATIVE, url: [...URL[Prefix.POSITIVE], ...URL[Prefix.NEGATIVE]][$index] };

				if (/^https:\/\/ltn.hitomi.la\/id\/([0-9]+)-[a-z]+\.nozomi$/.test(shortcut.url)) {
					$(shortcut.prefix, [Number(/^https:\/\/ltn.hitomi.la\/id\/([0-9]+)-[a-z]+\.nozomi$/.exec(shortcut.url)![1])]);
				}
				else if (SINGULAR || !this.collection[shortcut.url]) {
					request.get(shortcut.url, { encoding: "binary", headers: SINGULAR ? { "range": `bytes=${index * per_page * 4}-${index * per_page * 4 + per_page * 4 - 1}` } : {} }).then((response) => {
						switch (response.status.code) {
							case 200:
							case 206: {
								const array = this.unknown_1(response);
								// if only INDEX_ALL assigned
								if (SINGULAR) {
									size += Number((response.headers["content-range"]! as string).replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
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
