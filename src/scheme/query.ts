import listener from "@/modules/listener";

class Query {
	private text: {
		value: string,
		readonly get: () => Query["text"]["value"],
		readonly set: (text: string) => void,
		readonly clear: () => void;
	} = {
		// initial value
		value: "",
		// functions
		get: (): Query["text"]["value"] => {
			return this.text.value;
		},
		set: (text: string): void => {
			this.text.value = text;
			listener.emit("query_text", text);
		},
		clear: (): void => {
			this.text.set("");
		}
	};
	constructor() {
	}
	/* AUTO GENERATED RETURN TYPE */
	public index(property: "text") {
		return this[property];
	}
}
export default (new Query());
