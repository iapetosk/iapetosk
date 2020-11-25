import request from "@/modules/request";

import { RequestResponse } from "@/modules/request";

export type SearchResponse = {
	size: number,
	array: number[],
	singular: boolean;
};
export type SearchQuery = Record<SearchType, {
	action: SearchAction,
	value: string;
}[]>;
export type SearchType = (
	"id"		|
	"type"		|
	"character"	|
	"language"	|
	"series"	|
	"artist"	|
	"group"		|
	"tag"		|
	"male"		|
	"female"	|
	"custom"
);
export enum SearchAction {
	POSITIVE,
	NEGATIVE
};

class Search {
	private index_all = "https://ltn.hitomi.la/index-all.nozomi";
	private collection: Record<string, number[]> = {};
	constructor() {
		// TODO: none
	}
	public get(filter: SearchQuery, size: number, index: number) {
		return this.unknown_0(filter, size, index);
	}
	public unknown_0(filter: SearchQuery, size: number, index: number) {
		// array of gallery IDs
		let IDs: number[] = [];
		// length of gallery IDs
		let SIZE: number = 0;
		// request counts
		let COUNT: number = 0;
		// request adresses
		let URLs: Record<SearchAction, string[]> = {
			[SearchAction.POSITIVE]: [],
			[SearchAction.NEGATIVE]: []
		};
		return new Promise<SearchResponse>((resolve, rejects) => {
			for (const type of Object.keys(filter)) {
				switch (type) {
					case "language": {
						if (Object.values(filter).map((value) => { return value.length; }).reduce(($old, $new) => { return $old + $new; }, 0) - filter.language.length > 0) {
							break;
						}
						for (let index = 0; index < filter[type as SearchType].length; index++) {
							URLs[filter[type as SearchType][index].action].push(`https://ltn.hitomi.la/index-${filter[type as SearchType][index].value}.nozomi`);
						}
						break;
					}
					default: {
						for (let index = 0; index < filter[type as SearchType].length; index++) {
							for (const language of filter.language.length ? filter.language : [{ action: SearchAction.POSITIVE, value: "all" }]) {
								URLs[filter[type as SearchType][index].action].push(`https://ltn.hitomi.la/${type === "male" || type === "female" ? "tag" : type}/${type === "male" || type === "female" ? `${type}:${filter[type as SearchType][index].value}` : filter[type as SearchType][index].value}-${filter[type as SearchType][index].action === SearchAction.POSITIVE && language.action === SearchAction.POSITIVE ? language.value : "all"}.nozomi`);
							}
						}
						break;
					}
				}
			}
			if (URLs[SearchAction.POSITIVE].length === 0) {
				URLs[SearchAction.POSITIVE].unshift(this.index_all);
			}

			const SINGULAR: boolean = URLs[SearchAction.POSITIVE].length === 1 && URLs[SearchAction.NEGATIVE].length === 0 && URLs[SearchAction.POSITIVE][0] === this.index_all;

			function $(action: SearchAction, array: number[]) {
				const collection: Set<number> = new Set(array);
				// increase slot
				COUNT++;
				// determine action
				switch (action) {
					case SearchAction.POSITIVE: {
						if (IDs.length) {
							const LENGTH: number = IDs.length;
							IDs = IDs.filter((id) => collection.has(id));
							SIZE -= SINGULAR ? LENGTH - IDs.length : 0;
						} else {
							IDs = array;
						}
						break;
					}
					case SearchAction.NEGATIVE: {
						IDs = IDs.filter((id) => !collection.has(id));
						break;
					}
				}
				// none-async resolve
				if (COUNT === URLs[SearchAction.POSITIVE].length + URLs[SearchAction.NEGATIVE].length) {
					// debug
					console.table({
						positive: URLs[SearchAction.POSITIVE],
						negative: URLs[SearchAction.NEGATIVE],
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
			for (let index = 0; index < URLs[SearchAction.POSITIVE].length + URLs[SearchAction.NEGATIVE].length; index++) {
				const shortcut: {
					action: SearchAction,
					url: string;
				} = {
					action: SearchAction.POSITIVE,
					url: [...URLs[SearchAction.POSITIVE], ...URLs[SearchAction.NEGATIVE]][index]
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
								$(shortcut.action, array);
								break;
							}
						}
					});
				} else {
					$(shortcut.action, this.collection[shortcut.url]);
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
