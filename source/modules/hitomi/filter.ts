export enum Prefix {
	AND = "",
	EXCLUDE = "-",
	INCLUDE = "+"
};
export enum Field {
	ID = "id",
	TYPE = "type",
	CHARACTER = "character",
	LANGUAGE = "language",
	SERIES = "series",
	ARTIST = "artist",
	GROUP = "group",
	TAG = "tag",
	MALE = "male",
	FEMALE = "female",
	// custom
	STATUS = "status"
};
export type Tag = [
	Prefix,
	Field,
	string
];
export type Computable = [
	Prefix,
	Tag[]
][][];

const [TAG, PRF] = [
	// TAG
	new RegExp(["^", "(", Object.values(Prefix).join("|").replace(/[+]/g, "\\$&"), ")", "(", Object.values(Field).join("|"), ")", ":", "(", "[a-zA-Z0-9_]+", ")", "$"].join("")),
	// PRF
	new RegExp(["(", Object.values(Prefix).join("|").replace(/[+]/g, "\\$&"), ")", "$"].join(""))
];

class Filter {
	public get(value: string) {
		const pre: string[][] = [[]], post: Computable = [[]];

		let x = 0, y = 0, count = 0;

		for (const chunk of value.split("")) {
			switch (chunk) {
				case "(": {
					y++;
					break;
				}
				case ")": {
					y--;
					// next
					if (!y) {
						x++;
						pre[x] = [];
					}
					break;
				}
				default: {
					pre[x][y] = pre[x][y] ? pre[x][y] + chunk : chunk;
				}
			}
		}
		for (x = 0; x < pre.length; x++) {
			for (y = 0; y < pre[x].length; y++) {
				// avoid undefined
				if (!pre[x][y]) {
					continue;
				}
				for (const chunk of ("\u0020" + pre[x][y]).split("\u0020")) {
					/*
					0: unused
					1: prefix
					2: field
					3: value
					*/
					const tag = TAG.exec(chunk);

					if (!tag) {
						continue;
					}
					if (!post[x]) {
						post[x] = [];
					}
					if (!post[x][y]) {
						post[x][y] = [y ? PRF.exec(pre[x][y - 1])![1] as Prefix : Prefix.AND, []];
					}
					post[x][y][1].push([tag[1] as Prefix, tag[2] as Field, tag[3].replace(/_/g, "%20")]);

					count++;
				}
			}
		}
		return [post, count] as [Computable, number];
	}
}
export default (new Filter());
