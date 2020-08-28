import listener from "@/modules/listener";

class Query {
	private text: string = "";
	constructor() {
	}
	/* AUTO GENERATED RETURN TYPE */
	public get(property: "text") {
		return this[property];
	}
	public set(property: "text", value: any): void {
		this[property] = value;
		listener.emit(`query_${property}`, value);
	}
	/* FOLLOWING FUNCTIONS ARE FOR PROPERTY "THREADS" */
}
export default (new Query());
