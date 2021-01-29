import request from "@/modules/request";

import { RequestResponse } from "@/modules/request";
import { Prefix, Field, Tag, Computable } from "@/modules/hitomi/filter";

export type GalleryList = {
	size: number,
	array: number[],
	singular: boolean;
};

class Search {
	private collection: Record<string, number[]> = {};
	public get(filter: Computable, index: number, per_page: number) {
		return this.unknown_0(filter, index, per_page);
	}
	private unknown_0(filter: Computable, index: number, per_page: number) {
		// instance
		const I = this;
		// result
		const nozomi = {
			array: {
				local: new Array<number>(),
				global: new Array<number>()
			},
			size: 0,
			singular: is_SINGULAR()
		};
		function is_SINGULAR() {
			let singular = 0;

			for (const group of filter) {
				for (const [prefix, tags] of group) {
					for (const tag of tags) {
						if (tag[0] !== Prefix.EXCLUDE && tag[1] === Field.LANGUAGE && tag[2] === "all") {
							singular++;
						} else {
							return false;
						}
					}
				}
			}
			return singular === 1;
		}
		function get_URL(tag: Tag) {
			const [prefix, field, value] = tag;

			switch (field) {
				case Field.LANGUAGE: {
					return `https://ltn.hitomi.la/index-${value}.nozomi`;
				}
				case Field.MALE:
				case Field.FEMALE: {
					return `https://ltn.hitomi.la/tag/${field}:${value}-all.nozomi`;
				}
				default: {
					return `https://ltn.hitomi.la/${field}/${value}-all.nozomi`;
				}
			}
		}
		async function retrieve(tag: Tag) {
			const [prefix, field, value] = tag;

			switch (field) {
				case Field.ID: {
					return [Number(value)];
				}
				default: {
					const URL = get_URL(tag);

					if (!I.collection[URL]) {
						await request.GET(URL, { headers: nozomi.singular ? { "range": `bytes=${index * per_page * 4}-${index * per_page * 4 + per_page * 4 - 1}` } : {} }, "binary").then((response) => {
							switch (response.status.code) {
								case 200: // full
								case 206: // partitial
									{
										if (nozomi.singular) {
											// full length
											nozomi.size = Number((response.headers["content-range"]! as string).replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
											// return without save
											return I.unknown_1(response);
										}
										I.collection[URL] = I.unknown_1(response);
										break;
									}
							}
						});
					}
					return I.collection[URL];
				}
			}
		}
		function compute(prefix: Prefix, scope: "global" | "local", array: number[]) {
			switch (prefix) {
				case Prefix.AND: {
					if (!nozomi.array[scope].length) {
						nozomi.array[scope] = [...nozomi.array[scope], ...array];
						break;
					}
				}
				case Prefix.EXCLUDE: {
					const collection = new Set(array);
					nozomi.array[scope] = nozomi.array[scope].filter((id) => { return (prefix === Prefix.AND) === collection.has(id); });
					break;
				}
				case Prefix.INCLUDE: {
					nozomi.array[scope] = [...nozomi.array[scope], ...array];
					break;
				}
			}
		}
		return new Promise<GalleryList>(async (resolve, reject) => {
			/*
			follows are URL format.

			https://ltn.hitomi.la/index-{language}.nozomi
			https://ltn.hitomi.la/{field}/{value}-{language}.nozomi

			in conclusion, it's possible to optimize request response by provide specific {language} scope.
			however this will make extra complexity in understanding of codes thus I decided to do not.
			*/
			for (let x = 0; x < filter.length; x++) {
				for (let y = 0; y < filter[x].length; y++) {
					// avoid undefined
					if (!filter[x][y]) {
						continue;
					}
					nozomi.array.local = [];

					for (let z = 0; z < filter[x][y][1].length; z++) {
						compute(filter[x][y][1][z][0], "local", await retrieve(filter[x][y][1][z]));
					}
					compute(filter[x][y][0], "global", nozomi.array.local);
				}
			}
			if (!nozomi.array.global.length) {
				compute(Prefix.INCLUDE, "global", await retrieve([Prefix.INCLUDE, Field.LANGUAGE, "all"]));
			}
			return resolve({
				array: nozomi.array.global,
				size: nozomi.singular ? nozomi.size : nozomi.array.global.length,
				singular: nozomi.singular
			});
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
