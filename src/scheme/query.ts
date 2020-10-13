import listener from "@/modules/listener";

class Query {
	private static state: string = "";
	public get(): typeof Query.state {
		return Query.state;
	}
	public set(value: typeof Query.state): void {
		// listener [new, old]
		listener.emit("query.listen", value, this.get());
		// override
		Query.state = value;
	}
	public clear(): void {
		this.set("");
	}
}
export default (new Query());
