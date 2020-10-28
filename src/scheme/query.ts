import { Scheme, Schema } from "@/scheme";

class Query extends Schema<string> {
	public get(): Query["state"] {
		return this.$get();
	}
	public set(value: Query["state"]): void {
		return this.$set(value);
	}
	public clear(): void {
		this.set("");
	}
}
export default (new Query("", Scheme.QUERY));
