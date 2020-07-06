import request from "@/modules/request";

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
	public start(url: string): Promise<string[]> {
		return new Promise<string[]>(async (resolve, rejects) => {
			const I: Hitomi_La = this;
			function format(regex: RegExp, url: string, base: number) {
				const channel = parseInt(regex.exec(url)![1], base);
				return url.replace(/\[@\]/, String.fromCharCode(97 + (channel < 0x09 ? 1 : channel) % (channel < 0x30 ? 2 : I._number_of_frontends)) + "a");
			}
			async function recursive(galleryblock?: GalleryBlock) {
				galleryblock = galleryblock || await request.get(`https://ltn.hitomi.la/galleries/${/([0-9]+).html$/.exec(url)![1]}.js`).then((callback) => {
					return callback.response.statusCode === 404 ? undefined : JSON.parse(/var galleryinfo = ([\D\d]+)/.exec(callback.body)![1]) as GalleryBlock;
				});
				if (!galleryblock) {
					return rejects();
				}
				if (I._number_of_frontends === NaN) {
					setTimeout(() => {
						return recursive(galleryblock);
					}, 1000);
				} else {
					const links: string[] = [];

					for (const file of galleryblock.files) {
						if (file.hash) {
							const hash: string = file.hash.length < 3 ? file.hash : file.hash.replace(/^.*(..)(.)$/, "$2/$1/" + file.hash);
							if (file.haswebp) {
								links.push(format(/webp\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@].hitomi.la/webp/${hash}.webp`, 16));
							} else {
								links.push(format(/images\/[0-9a-f]\/([0-9a-f]{2})/, `https://[@].hitomi.la/images/${hash}.${file.name.split(/\./).pop()}`, 16));
							}
						} else {
							links.push(format(/galleries\/\[0-9]*(0-9)/, `https://[@].hitomi.la/galleries/${/([0-9]+).html$/.exec(url)![1]}/${file.name}`, 10));
						}
					}
					return resolve(links);
				}
			}
			return recursive();
		});
	}
}

export default (new Hitomi_La());
