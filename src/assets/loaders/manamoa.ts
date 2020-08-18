import request, { PartialOptions } from "@/modules/request";
import { Loaded, PlaceHolders } from "@/modules/download";
import utility from "@/modules/utility";
class Manamoa {
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
					utility.extract(callback.content.encode, "img_list", "array"),
					utility.extract(callback.content.encode, "img_list1", "array")
				];
				const domains: string[] = utility.extract(callback.content.encode, "cdn_domains", "array");
				const chapter: number = utility.extract(callback.content.encode, "chapter", "number");

				for (let x: number = 0; x < list.length; x++) {
					for (let y: number = 0; y < list[x].length; y++) {
						if (!list[x][y]) {
							continue;
						}
						links[y] = list[x][y].replace(/\\/g, "");

						for (const charset of ["cdntigermask.xyz", "cdnmadmax.xyz", "filecdn.xyz"]) {
							links[y] = links[y].replace(charset, domains[(chapter + 4 * y) % domains.length]);
						}
					}
				}
				return resolve({
					title: utility.parse(callback.content.encode, "meta[name=\"title\"]", "content") as string,
					links: links,
					options: options,
					placeholders: placeholders
				});
			});
		});
	}
}

export default (new Manamoa());
