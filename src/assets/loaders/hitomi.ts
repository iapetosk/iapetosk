import request from "@/modules/request";
import utility from "@/modules/utility";

import { PartialOptions } from "@/modules/request";
import { PlaceHolders, Loaded } from "@/modules/download";

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

class Hitomi_La {
	private common_js?: string = "";
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			this.common_js = callback.content.encode.split(/function show_loading/)![0];
		});
	}
	public start(url: string): Promise<Loaded> {
		const I: Hitomi_La = this;

		const links: string[] = [
			// TODO: none
		];
		const options: PartialOptions = {
			headers: {
				"referer": url
			}
		};
		const placeholders: PlaceHolders = {
			// TODO: none
		};
		return new Promise<Loaded>(async (resolve, rejects) => {
			async function recursive(gallery?: GalleryBlock) {
				gallery = gallery || await request.get(`https://ltn.hitomi.la/galleries/${I.ID(url)}.js`).then((callback) => {
					return callback.status.code === 404 ? undefined : utility.extract(`${callback.content.encode};`, "galleryinfo", "object");
				});
				if (!gallery) {
					return rejects(404);
				}
				if (I.common_js) {
					for (let index: number = 0; index < gallery.files.length; index++) {
						links[index] = eval(I.common_js + "url_from_url_from_hash(gallery.id, gallery.files[index]);") as string;
					}
					return resolve({
						title: gallery.title,
						links: links,
						options: options,
						placeholders: {
							id: gallery.id,
							title: gallery.title,
							language: gallery.language
						}
					});
				} else {
					setTimeout(() => {
						return recursive(gallery);
					}, 1000);
				}
			}
			return recursive();
		});
	}
	public ID(url: string): number {
		return Number(new RegExp(/([0-9]+).html$/).exec(url)![1]);
	}
}

export default (new Hitomi_La());
