import request, { PartialOptions } from "@/modules/request";
import { Loaded, PlaceHolders } from "@/modules/download";
import utility from "@/modules/utility";
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
					const links: string[] = [
						// TODO: none
					];
					const options: PartialOptions = {
						headers: {
							referer: `https://hitomi.la/reader/${ID}.html`
						}
					};
					const placeholders: PlaceHolders = {
						id: ID
					};
					galleryblock.files.forEach((file, index) => {
						if (file.hash) {
							// server logic
							const hash: string = file.hash.length < 3 ? file.hash : file.hash.replace(/^.*(..)(.)$/, "$2/$1/" + file.hash);
							// condition
							if (file.haswebp) {
								links[index] = format(/webp\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@]a.hitomi.la/webp/${hash}.webp`, 16);
							} else {
								links[index] = format(/images\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@]a.hitomi.la/images/${hash}.${file.name.split(/\./).pop()}`, 16);
							}
						} else {
							links[index] = format(/galleries\/\[0-9]*(0-9)/, `https://[@]a.hitomi.la/galleries/${ID}/${file.name}`, 10);
						}
					});
					request.get(`https://ltn.hitomi.la/galleryblock/${ID}.html`).then((callback) => {
						(utility.parser(callback.body, "td") as string[]).forEach((value, index) => {
							if (index % 2) {
								placeholders[Object.keys(placeholders).pop()!] = utility.unwrap(value.split(/\s\s+/g).filter((value) => { return value.length; }));
							} else {
								placeholders[value.toLowerCase()] = undefined;
							}
						});
						return resolve({
							links: links,
							options: options,
							placeholders: {
								title: utility.parser(callback.body, ".lillie a")[0],
								date: utility.parser(callback.body, ".date")[0],
								...placeholders
							}
						});
					});
				}
			}
			return recursive();
		});
	}
}

export default (new Hitomi_La());
