import request from "@/modules/request";
import utility from "@/modules/utility";
import { PartialOptions } from "@/modules/request";
import { PlaceHolders, Loaded } from "@/modules/download";

export type GalleryBlock = {
	language_localname: string,
	language: string,
	date: string,
	files: {
		width: number,
		height: number,
		hasavif: number,
		haswebp: number,
		name: string,
		hash: string;
	}[];
};

class Hitomi_La {
	private number_of_frontends: number = NaN;
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			this.number_of_frontends = utility.extract(callback.content.encode, "number_of_frontends", "number");
		});
	}
	public start(url: string): Promise<Loaded> {
		const I: Hitomi_La = this;

		const links: string[] = [
			// TODO: none
		];
		const options: PartialOptions = {
			headers: {
				"referer": "https://hitomi.la/search.html"
			}
		};
		const placeholders: PlaceHolders = {
			id: I.ID(url)
		};
		return new Promise<Loaded>(async (resolve, rejects) => {
			function format(regex: RegExp, url: string, base: number): string {
				const chapter: number = parseInt(regex.exec(url)![1], base);
				return url.replace(/@/g, String.fromCharCode(97 + (chapter < 0x09 ? 1 : chapter) % (chapter < 0x30 ? 2 : I.number_of_frontends)).toString());
			}
			async function recursive(galleryblock?: GalleryBlock) {
				galleryblock = galleryblock || await request.get(`https://ltn.hitomi.la/galleries/${I.ID(url)}.js`).then((callback) => {
					return callback.status.code === 404 ? undefined : utility.extract(`${callback.content.encode};`, "galleryinfo", "object") as GalleryBlock;
				});
				if (!galleryblock) {
					return rejects();
				}
				if (isNaN(I.number_of_frontends)) {
					setTimeout(() => {
						return recursive(galleryblock);
					}, 1000);
				} else {
					galleryblock.files.forEach((file, index) => {
						if (file.hash) {
							// server logic
							const hash: string = file.hash.length < 3 ? file.hash : file.hash.replace(/^.*(..)(.)$/, "$2/$1/" + file.hash);
							// condition
							if (file.haswebp) {
								links[index] = format(/webp\/[0-9a-f]\/([0-9a-f]{2})/, `https://@a.hitomi.la/webp/${hash}.webp`, 16);
							} else {
								links[index] = format(/images\/[0-9a-f]\/([0-9a-f]{2})/, `https://@a.hitomi.la/images/${hash}.${file.name.split(/\./).pop()}`, 16);
							}
						} else {
							links[index] = format(/galleries\/\[0-9]*(0-9)/, `https://@a.hitomi.la/galleries/${I.ID(url)}/${file.name}`, 10);
						}
					});
					request.get(`https://ltn.hitomi.la/galleryblock/${I.ID(url)}.html`).then((callback) => {
						(utility.parse(callback.content.encode, "td") as string[]).forEach((value, index) => {
							if (index % 2) {
								placeholders[Object.keys(placeholders).pop()!] = utility.unwrap(value.split(/\s\s+/).filter((value) => { return value.length; }));
							} else {
								placeholders[value.toLowerCase()] = undefined;
							}
						});
						return resolve({
							title: utility.parse(callback.content.encode, ".lillie a") as string,
							links: links,
							options: options,
							placeholders: placeholders
						});
					});
				}
			}
			return recursive();
		});
	}
	public ID(url: string): number {
		return parseInt(/([0-9]+).html$/.exec(url)![1]);
	}
}

export default (new Hitomi_La());
