import request from "@/modules/request";
import utility from "@/modules/utility";

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
export type GalleryFile = {
	name: string,
	hash: string,
	width: number,
	height: number,
	haswebp: boolean,
	hasavif: boolean,
	hasavifsmalltn: boolean;
};
export type GalleryJS = Merge<{
	id: number,
	title: string,
	japanese_title?: string,
	language: string,
	language_localname: string,
	files: GalleryFile[],
	tags?: {
		female?: number,
		male?: number,
		url: string,
		tag: string;
	}[],
	date: string;
}, {
	files: {
		url: string,
		width: number,
		height: number;
	}[];
}>;

class Read {
	public block(id: number) {
		return new Promise<GalleryBlock>((resolve, reject) => {
			const object: Record<string, any> = {};

			request.get(`https://ltn.hitomi.la/galleryblock/${id}.html`).then((response) => {
				for (const [index, value] of (utility.parse(response.encode, "td") as string[]).entries()) {
					if (index % 2) {
						object[Object.keys(object).pop()!] = utility.unwrap(value.split(/\s\s+/).filter((value) => { return value.length; }));
					} else {
						object[value.toLowerCase()] = undefined;
					}
				}
				// resolve
				return resolve({
					...object,
					...{
						id: id,
						title: (utility.parse(response.encode, ".lillie a")),
						thumbnail: (utility.parse(response.encode, "img", "src") as [string, string]).map((value, index) => { return "https:" + value; }),
						artist: (utility.parse(response.encode, ".artist-list a")),
						date: (utility.parse(response.encode, ".date")),
					}
				} as GalleryBlock);
			});
		});
	}
	public script(id: number) {
		return new Promise<GalleryJS>((resolve, reject) => {
			request.get(`https://ltn.hitomi.la/galleries/${id}.js`).then((response) => {
				switch (response.status.code) {
					case 404: {
						return reject();
					}
					default: {
						const script: GalleryJS = utility.extract(`${response.encode};`, "galleryinfo", "object");
						// resolve
						return resolve({
							...script,
							files: script.files.map((value, index) => {
								return {
									// @ts-ignore
									url: this.unknown_0(script.id, script.files[index]),
									width: value.width,
									height: value.height
								};
							})
						});
					}
				}
			});
		});
	}
	// @see common.js > url_from_url_from_hash
	private unknown_0(id: number, image: GalleryFile, directory?: string, extension?: string, subdomain?: string) {
		return this.unknown_3(this.unknown_5(id, image, directory, extension), subdomain);
	}
	// @see common.js > subdomain_from_galleryid
	private unknown_1(value: number, number_of_frontends: number) {
		return String.fromCharCode(97 + (value % number_of_frontends));
	}
	// @see common.js > subdomain_from_url
	private unknown_2(url: string, subdomain: string = "b") {
		const match = /\/[0-9a-f]\/([0-9a-f]{2})\//.exec(url);

		if (!match) {
			return "a";
		}
		const offset = parseInt(match[1], 16);

		if (!isNaN(offset)) {
			return this.unknown_1(offset < 0x09 ? 1 : offset, offset < 0x30 ? 2 : 3) + subdomain;
		}
		return subdomain;
	}
	// @see common.js > url_from_url
	private unknown_3(url: string, subdomain?: string) {
		return url.replace(/\/\/..?\.hitomi\.la\//, `//${this.unknown_2(url, subdomain)}.hitomi.la/`);
	}
	// @see common.js > full_path_from_hash
	private unknown_4(hash: string) {
		if (hash.length < 3) {
			return hash;
		}
		return hash.replace(/^.*(..)(.)$/, "$2/$1/" + hash);
	}
	// @see common.js > url_from_hash
	private unknown_5(id: number, image: GalleryFile, directory?: string, extension?: string) {
		extension = extension || directory || image.name.split(/\./).pop();
		directory = directory || "images";

		return `https://a.hitomi.la/${directory}/${this.unknown_4(image.hash)}.${extension}`;
	}
}
export default (new Read());
