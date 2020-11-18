import hitomi from "@/modules/hitomi";

import { Loaded } from "@/modules/download";

class Hitomi_La {
	public start(url: string): Promise<Loaded> {
		return new Promise<Loaded>(async (resolve, rejects) => {
			hitomi.read(this.ID(url)).then((gallery) => {
				hitomi.files(gallery).then((files) => {
					return resolve({
						title: gallery.title,
						links: files,
						options: {
							headers: {
								"referer": url
							}
						},
						placeholders: {
							id: gallery.id,
							title: gallery.title,
							language: gallery.language
						}
					});
				})
			});
		});
	}
	public ID(url: string): number {
		return Number(/([0-9]+).html$/.exec(url)![1]);
	}
}

export default (new Hitomi_La());
