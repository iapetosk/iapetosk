import read from "@/modules/hitomi/read";

import { Loaded } from "@/modules/download";

class Hitomi_La {
	public start(url: string): Promise<Loaded> {
		return new Promise<Loaded>(async (resolve, rejects) => {
			read.script(this.ID(url)).then((script) => {
				return resolve({
					title: script.title,
					links: script.files.map((value, index) => { return value.url; }),
					options: {
						headers: {
							"referer": url
						}
					},
					placeholders: {
						id: script.id,
						title: script.title,
						language: script.language
					}
				});
			})
		});
	}
	public ID(url: string): number {
		return Number(/([0-9]+).html$/.exec(url)![1]);
	}
}

export default (new Hitomi_La());
