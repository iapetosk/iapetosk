import utility from "@/modules/utility";
import request from "@/modules/request";

export type GalleryBlock = {
	id: number,
	// title
	japanese_title: string,
	title: string,
	// language
	language_localname: string,
	language: string,
	// files
	files: {
		width: number,
		height: number,
		hasavif: number,
		haswebp: number,
		name: string,
		hash: string;
	}[],
	// tags
	tags: {
		female: number,
		male: number,
		url: string,
		tag: string;
	}[],
	// date
	date: string;
};
export type Filter = Record<Type, {
	action: Action,
	value: string;
}[]>;
export type Type = "language" | "type" | "series" | "artist" | "group" | "character" | "male" | "female" | "id" | "custom";
export enum Action {
	POSITIVE,
	NEGATIVE
}

class Hitomi_La {
	private static common_js: string = "";
	private static index_all: string = "https://ltn.hitomi.la/index-all.nozomi";
	private static collection: Record<string, number[]> = {};
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			Hitomi_La.common_js = callback.content.encode.split(/function show_loading/)![0];
		});
	}
	public search(filter: Filter, page: { size: number, index: number; }): Promise<{ IDs: number[], SIZE: number; }> {
		let IDs: number[] = [];
		let SIZE: number = 0;
		let URLs: Record<Action, string[]> = {
			[Action.POSITIVE]: [],
			[Action.NEGATIVE]: []
		};
		return new Promise<{ IDs: number[], SIZE: number; }>(async (resolve, rejects) => {
			for (const type of Object.keys(filter)) {
				switch (type) {
					case "language": {
						if (filter.type.length + filter.series.length + filter.artist.length + filter.group.length + filter.character.length + filter.male.length + filter.female.length + filter.id.length + filter.custom.length) {
							break;
						}
						for (let index: number = 0; index < filter[type as Type].length; index++) {
							URLs[filter[type as Type][index].action].push(`https://ltn.hitomi.la/index-${filter[type as Type][index].value}.nozomi`);
						}
						break;
					}
					default: {
						for (let index: number = 0; index < filter[type as Type].length; index++) {
							for (const language of Object.values(filter.language || [{ action: Action.POSITIVE, value: "all" }])) {
								URLs[filter[type as Type][index].action].push(`https://ltn.hitomi.la/${type === "male" || type === "female" ? "tag" : type}/${filter[type as Type][index].value}-${filter[type as Type][index].action === Action.POSITIVE && language.action === Action.POSITIVE ? language.value : "all"}.nozomi`);
							}
						}
						break;
					}
				}
			}
			if (URLs[Action.POSITIVE][0].length === 0) {
				URLs[Action.POSITIVE].unshift(Hitomi_La.index_all);
			}

			const SINGULAR: boolean = URLs[Action.POSITIVE][0].length === 1 && URLs[Action.NEGATIVE].length === 0 && URLs[Action.POSITIVE][0] === Hitomi_La.index_all;

			function $(action: Action, list: number[]): void {
				const collection: Set<number> = new Set(list);

				switch (action) {
					case Action.POSITIVE: {
						if (IDs.length) {
							const LENGTH: number = IDs.length;
							IDs = IDs.filter((id) => collection.has(id));
							SIZE -= SINGULAR ? LENGTH - IDs.length : 0;
						} else {
							IDs = list;
						}
						break;
					}
					case Action.NEGATIVE: {
						IDs = IDs.filter((id) => !collection.has(id));
						break;
					}
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

				if (SINGULAR || !Hitomi_La.collection[shortcut.url]) {
					await request.get(URLs[0][0], { encoding: "binary", headers: SINGULAR ? { "range": `bytes=${page.index * page.size * 4}-${page.index * page.size * 8 - 1}` } : {} }).then((callback) => {
						switch (callback.status.code) {
							case 200:
							case 206: {
								const view: DataView = new DataView(callback.content.buffer.slice(callback.content.buffer.byteOffset, callback.content.buffer.byteOffset + callback.content.buffer.byteLength));
								const list: number[] = [];

								for (let $index: number = 0; $index < view.byteLength; $index++) {
									list.push(view.getInt32($index * 4, false));
								}
								if (SINGULAR) {
									SIZE += Number((callback.content.headers["content-range"]! as string).replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
								} else {
									Hitomi_La.collection[shortcut.url] = list;
								}
								$(shortcut.action, list);
								break;
							}
						}
					});
				} else {
					$(shortcut.action, Hitomi_La.collection[shortcut.url]);
				}
			}
			// debug
			console.table(URLs);

			return resolve({
				IDs: IDs,
				SIZE: SIZE
			});
		});
	}
	public read(id: number): Promise<GalleryBlock> {
		return new Promise<GalleryBlock>((resolve, rejects) => {
			request.get(`https://ltn.hitomi.la/galleries/${id}.js`).then((callback) => {
				return resolve(callback.status.code === 404 ? undefined : utility.extract(`${callback.content.encode};`, "galleryinfo", "object"));
			});
		});
	}
	public files(gallery: GalleryBlock): Promise<string[]> {
		const files: string[] = [];
		return new Promise<string[]>(async (resolve, rejects) => {
			async function recursive() {
				if (Hitomi_La.common_js.length) {
					for (let index: number = 0; index < gallery.files.length; index++) {
						files[index] = eval(Hitomi_La.common_js + "url_from_url_from_hash(gallery.id, gallery.files[index]);") as string;
					}
					return resolve(files);
				} else {
					setTimeout(() => {
						return recursive();
					}, 250);
				}
			}
			return recursive();
		});
	}
}
export default (new Hitomi_La());
