import listener from "@/modules/listener";

class Query {
	private text: {
		value: string,
		readonly get: () => Query["text"]["value"],
		readonly set: (text: Query["text"]["value"]) => void,
		readonly clear: () => void;
	} = {
		// initial
		value: "",
		// functions
		get: (): Query["text"]["value"] => {
			return this.text.value;
		},
		set: (text: Query["text"]["value"]): void => {
			// listener [new, old]
			listener.emit("query.text", text, this.text.get());
			// override
			this.text.value = text;
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
