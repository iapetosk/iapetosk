import { Scheme, Schema } from "@/scheme";

class Query extends Schema<string> {
	public get() {
		return this.$get();
	}
	public set(value: Query["state"]) {
		return this.$set(value);
	}
	public clear(): void {
		this.set("");
	}
}
export default (new Query("", Scheme.QUERY));
