export enum Prefix {
	POSITIVE = "",
	NEGATIVE = "-"
};
export type Tag = (
	"id"		|
	"type"		|
	"character"	|
	"language"	|
	"series"	|
	"artist"	|
	"group"		|
	"tag"		|
	"male"		|
	"female"	|
	"custom"
);
export type Keyword = {
	[key in Tag]: {
		prefix: Prefix,
		value: string
	}[]
};

const RegExp = /^([-])*(id|type|language|character|series|artist|group|tag|male|female|custom):([a-zA-Z0-9_]+)$/;

class Filter {
	public get(input: string) {
		const output: Keyword = {
			"id": [],
			"type": [],
			"language": [],
			"character": [],
			"series": [],
			"artist": [],
			"group": [],
			"tag": [],
			"male": [],
			"female": [],
			"custom": []
		};
		for (const keyword of input.toLowerCase().split(/\s+/)) {
			if (RegExp.test(keyword)) {
				/*
				[0] = string
				[1] = string | undefined
				[2] = string
				[3] = string
				*/
				const [unused, prefix, tag, value] = RegExp.exec(keyword)!;

				output[tag as Tag].push({
					prefix: prefix ? prefix as Prefix : Prefix.POSITIVE,
					value: value.replace(/_/g, "%20")
				});
			}
		}
		return output;
	}
}
export default (new Filter());
