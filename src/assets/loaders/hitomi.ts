import hitomi_la from "@/modules/hitomi";

import { PartialOptions } from "@/modules/request";
import { PlaceHolders, Loaded } from "@/modules/download";

class Hitomi_La {
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
			hitomi_la.read(this.ID(url)).then((gallery) => {
				hitomi_la.files(gallery).then((files) => {
					return resolve({
						title: gallery.title,
						links: files,
						options: options,
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
		return Number(new RegExp(/([0-9]+).html$/).exec(url)![1]);
	}
}

export default (new Hitomi_La());
