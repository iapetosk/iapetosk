import request from "@/modules/request";
import utility from "@/modules/utility";
import { Loaded } from "@/modules/download";

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
	private _number_of_frontends: number = NaN;
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			this._number_of_frontends = parseInt(/var number_of_frontends = ([0-9]+)/.exec(callback.body)![1]);
		});
	}
	public start(url: string): Promise<Loaded> {
		return new Promise<Loaded>(async (resolve, rejects) => {
			const I: Hitomi_La = this;
			const ID: string = /([0-9]+).html$/.exec(url)![1];
			function format(regex: RegExp, url: string, base: number): string {
				const channel = parseInt(regex.exec(url)![1], base);
				return url.replace("[@]", String.fromCharCode(97 + (channel < 0x09 ? 1 : channel) % (channel < 0x30 ? 2 : I._number_of_frontends)).toString());
			}
			async function recursive(galleryblock?: GalleryBlock) {
				galleryblock = galleryblock || await request.get(`https://ltn.hitomi.la/galleries/${ID}.js`).then((callback) => {
					return callback.response.statusCode === 404 ? undefined : JSON.parse(/var galleryinfo = ([\D\d]+)/.exec(callback.body)![1]) as GalleryBlock;
				});
				if (!galleryblock) {
					return rejects();
				}
				if (isNaN(I._number_of_frontends)) {
					setTimeout(() => {
						return recursive(galleryblock);
					}, 1000);
				} else {
					const LOADED: Loaded = {
						links: [],
						options: {
							headers: {
								referer: `https://hitomi.la/reader/${ID}.html`
							}
						},
						placeholders: {}
					};
					galleryblock.files.forEach((file, index) => {
						if (file.hash) {
							const hash: string = file.hash.length < 3 ? file.hash : file.hash.replace(/^.*(..)(.)$/, "$2/$1/" + file.hash);

							if (file.haswebp) {
								LOADED.links[index] = format(/webp\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@]a.hitomi.la/webp/${hash}.webp`, 16);
							} else {
								LOADED.links[index] = format(/images\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@]a.hitomi.la/images/${hash}.${file.name.split(/\./).pop()}`, 16);
							}
						} else {
							LOADED.links[index] = format(/galleries\/\[0-9]*(0-9)/, `https://[@]a.hitomi.la/galleries/${ID}/${file.name}`, 10);
						}
					});
					request.get(`https://ltn.hitomi.la/galleryblock/${ID}.html`).then((callback) => {
						new DOMParser().parseFromString(callback.body, "text/html").querySelectorAll("td").forEach((element, index) => {
							const value: string[] = element.innerText.split(/\s\s+/g).filter((value) => { return value.length; });

							if (index % 2) {
								LOADED.placeholders[Object.keys(LOADED.placeholders).pop()!] = utility.minify(value);
							} else {
								LOADED.placeholders[value[0].toLowerCase()] = undefined;
							}
						});
						return resolve(LOADED);
					});
				}
			}
			return recursive();
		});
	}
}

export default (new Hitomi_La());
