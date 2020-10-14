import Request from "@/modules/request";
import Utility from "@/modules/Utility";

import { PartialOptions } from "@/modules/request";
import { PlaceHolders, Loaded } from "@/modules/download";

class JMana {
	public start(url: string): Promise<Loaded> {
		const links: string[] = [
			// TODO: none
		];
		const options: PartialOptions = {
			agent: true,
			headers: {
				"referer": url,
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0"
			}
		};
		const placeholders: PlaceHolders = {
			// TODO: none
		};
		return new Promise<Loaded>(async (resolve, rejects) => {
			Request.get(url, { agent: true }).then((callback) => {
				const list: string[][] = [
					Utility.parse(callback.content.encode, ".view > li > img:nth-child(1)", "src") as string[],
					Utility.parse(callback.content.encode, ".view > li > img:nth-child(1)", "data-src") as string[]
				];
				for (let x: number = 0; x < list.length; x++) {
					for (let y: number = 0; y < list[x].length; y++) {
						if (!list[x][y]) {
							continue;
						}
						links[y] = list[x][y];
					}
				}
				return resolve({
					title: Utility.parse(callback.content.encode, "title") as string,
					links: links,
					options: options,
					placeholders: placeholders
				});
			});
		});
	}
}

export default (new JMana());
