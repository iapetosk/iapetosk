import utility from "@/modules/utility";
import request from "@/modules/request";

import { RequestResponse } from "@/modules/request";

export type Type = (
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
export enum Action {
	POSITIVE,
	NEGATIVE
};
export type Filter = Record<Type, {
	action: Action,
	value: string;
}[]>;
export type Archive = {
	size: number,
	array: number[],
	singular: boolean;
};
export type GalleryBlock = {
	id: number,
	type: string,
	title: string,
	language: string,
	thumbnail: string[];
	character?: string[],
	artist?: string[],
	series?: string,
	group?: string,
	tags?: string[],
	date: string;
};
export type GalleryJS = {
	id: number,
	title: string,
	japanese_title?: string,
	language: string,
	language_localname: string,
	files: {
		url: string,
		width: number,
		height: number;
	}[],
	tags?: {
		female?: number,
		male?: number,
		url: string,
		tag: string;
	}[],
	date: string;
};

class Hitomi_La {
	private static index_all: string = "https://ltn.hitomi.la/index-all.nozomi";
	private static common_js: string = "";
	private static collection: {
		array: Record<string, number[]>,
		block: Record<number, GalleryBlock>,
		script: Record<number, GalleryJS>;
	} = {
		array: {},
		block: {},
		script: {}
	};
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			Hitomi_La.common_js = callback.encode.split(/function show_loading/)![0];
		});
	}
	public search(filter: Filter, page: { size: number, index: number; }): Promise<Archive> {
		// array of gallery IDs
		let IDs: number[] = [];
		// length of gallery IDs
		let SIZE: number = 0;
		// request counts
		let COUNT: number = 0;
		// request adresses
		let URLs: Record<Action, string[]> = {
			[Action.POSITIVE]: [],
			[Action.NEGATIVE]: []
		};
		return new Promise<Archive>((resolve, rejects) => {
			for (const type of Object.keys(filter)) {
				switch (type) {
					case "language": {
						if (Object.values(filter).map((value) => { return value.length; }).reduce(($old, $new) => { return $old + $new; }, 0) - filter.language.length > 0) {
							break;
						}
						for (let index: number = 0; index < filter[type as Type].length; index++) {
							URLs[filter[type as Type][index].action].push(`https://ltn.hitomi.la/index-${filter[type as Type][index].value}.nozomi`);
						}
						break;
					}
					default: {
						for (let index: number = 0; index < filter[type as Type].length; index++) {
							for (const language of filter.language.length ? filter.language : [{ action: Action.POSITIVE, value: "all" }]) {
								URLs[filter[type as Type][index].action].push(`https://ltn.hitomi.la/${type === "male" || type === "female" ? "tag" : type}/${type === "male" || type === "female" ? `${type}:${filter[type as Type][index].value}` : filter[type as Type][index].value}-${filter[type as Type][index].action === Action.POSITIVE && language.action === Action.POSITIVE ? language.value : "all"}.nozomi`);
							}
						}
						break;
					}
				}
			}
			if (URLs[Action.POSITIVE].length === 0) {
				URLs[Action.POSITIVE].unshift(Hitomi_La.index_all);
			}

			const SINGULAR: boolean = URLs[Action.POSITIVE].length === 1 && URLs[Action.NEGATIVE].length === 0 && URLs[Action.POSITIVE][0] === Hitomi_La.index_all;

			function $(action: Action, array: number[]): void {
				const collection: Set<number> = new Set(array);
				// increase slot
				COUNT++;
				// determine action
				switch (action) {
					case Action.POSITIVE: {
						if (IDs.length) {
							const LENGTH: number = IDs.length;
							IDs = IDs.filter((id) => collection.has(id));
							SIZE -= SINGULAR ? LENGTH - IDs.length : 0;
						} else {
							IDs = array;
						}
						break;
					}
					case Action.NEGATIVE: {
						IDs = IDs.filter((id) => !collection.has(id));
						break;
					}
				}
				// none-async resolve
				if (COUNT === URLs[Action.POSITIVE].length + URLs[Action.NEGATIVE].length) {
					// debug
					console.table({
						positive: URLs[Action.POSITIVE],
						negative: URLs[Action.NEGATIVE],
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
			for (let index: number = 0; index < URLs[Action.POSITIVE].length + URLs[Action.NEGATIVE].length; index++) {
				const shortcut: {
					action: Action,
					url: string;
				} = {
					action: Action.POSITIVE,
					url: [...URLs[Action.POSITIVE], ...URLs[Action.NEGATIVE]][index]
				};

				if (SINGULAR || !Hitomi_La.collection.array[shortcut.url]) {
					request.get(shortcut.url, { encoding: "binary", headers: SINGULAR ? { "range": `bytes=${page.index * page.size * 4}-${page.index * page.size * 4 + page.size * 4 - 1}` } : {} }).then((callback) => {
						switch (callback.status.code) {
							case 200:
							case 206: {
								const array: number[] = this.nozomi(callback);
								// if only INDEX_ALL assigned
								if (SINGULAR) {
									SIZE += Number((callback.headers["content-range"]! as string).replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
								} else {
									Hitomi_La.collection.array[shortcut.url] = array;
								}
								$(shortcut.action, array);
								break;
							}
						}
					});
				} else {
					$(shortcut.action, Hitomi_La.collection.array[shortcut.url]);
				}
			}
		});
	}
	public block(id: number): Promise<GalleryBlock> {
		return new Promise<GalleryBlock>((resolve, rejects) => {
			// assigned
			if (Hitomi_La.collection.block[id]) {
				// resolve
				return resolve(Hitomi_La.collection.block[id]);
			}
			const object: Record<string, any> = {};

			request.get(`https://ltn.hitomi.la/galleryblock/${id}.html`).then((callback) => {
				for (const [index, value] of (utility.parse(callback.encode, "td") as string[]).entries()) {
					if (index % 2) {
						object[Object.keys(object).pop()!] = utility.unwrap(value.split(/\s\s+/).filter((value) => { return value.length; }));
					} else {
						object[value.toLowerCase()] = undefined;
					}
				}
				// assign
				Hitomi_La.collection.block[id] = {
					...object,
					...{
						id: id,
						title: (utility.parse(callback.encode, ".lillie a") as string),
						thumbnail: (utility.parse(callback.encode, "img", "src") as string[]).map((value, index) => { return "https:" + value; }),
						artist: (utility.parse(callback.encode, ".artist-list a") as string[]),
						date: (utility.parse(callback.encode, ".date") as string),
					}
				} as GalleryBlock;
				// resolve
				return resolve(Hitomi_La.collection.block[id]);
			});
		});
	}
	public script(id: number): Promise<GalleryJS> {
		return new Promise<GalleryJS>((resolve, rejects) => {
			// assigned
			if (Hitomi_La.collection.script[id]) {
				// resolve
				return resolve(Hitomi_La.collection.script[id]);
			}
			function recursive(script: GalleryJS) {
				switch (Hitomi_La.common_js.length) {
					case 0: {
						setTimeout(() => {
							return recursive(script);
						}, 250);
						break;
					}
					default: {
						// assign
						Hitomi_La.collection.script[id] = {
							...script,
							files: script.files.map((value, index) => {
								return {
									url: "https:" + eval(Hitomi_La.common_js + "url_from_url_from_hash(gallery.id, gallery.files[index]);") as string,
									width: value.width,
									height: value.height
								};
							})
						} as GalleryJS;
						// resolve
						return resolve(Hitomi_La.collection.script[id]);
					}
				}
			}
			request.get(`https://ltn.hitomi.la/galleries/${id}.js`).then((callback) => {
				switch (callback.status.code) {
					case 404: {
						return rejects();
					}
					default: {
						return recursive(utility.extract(`${callback.encode};`, "galleryinfo", "object"));
					}
				}
			});
		});
	}
	public nozomi(response: RequestResponse): number[] {
		const binary: Buffer = new Buffer(response.encode, "binary");
		const endian: DataView = new DataView(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength));
		const array: Array<number> = new Array(endian.byteLength / 4);

		for (let index: number = 0; index < endian.byteLength / 4; index++) {
			array[index] = endian.getInt32(index * 4, false);
		}
		return array;
	}
}
export default (new Hitomi_La());
