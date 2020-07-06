import request from "@/modules/request";

class Hitomi_La {
	private _number_of_frontends: number = 0;
	constructor() {
		request.get("https://ltn.hitomi.la/common.js").then((callback) => {
			console.log(callback.body);
		})
	}
	public start(url: string): Promise<string[]> {
		return new Promise<string[]>((resolve, rejects) => {
			return resolve(url.split(""));
		});
	}
}

export default (new Hitomi_La());
