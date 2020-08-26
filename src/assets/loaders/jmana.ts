import request from "@/modules/request";
import utility from "@/modules/utility";
import { PartialOptions } from "@/modules/request";
import { PlaceHolders, Loaded } from "@/modules/download";
class JMana {
	public start(url: string): Promise<Loaded> {
		const links: string[] = [
			// TODO: none
		];
		const options: PartialOptions = {
			// TODO: none
		};
		const placeholders: PlaceHolders = {
			// TODO: none
		};
		return new Promise<Loaded>(async (resolve, rejects) => {
			request.get(url).then((callback) => {
				const list: string[][] = [
					utility.parse(callback.content.encode, ".view > li > img", "src") as string[],
					utility.parse(callback.content.encode, ".view > li > img", "data-src") as string[]
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
					title: utility.parse(callback.content.encode, "title") as string,
					links: links,
					options: options,
					placeholders: placeholders
				});
			});
		});
	}
}

export default (new JMana());
