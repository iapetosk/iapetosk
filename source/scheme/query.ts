import settings from "@/modules/configure";

import { Scheme, Schema } from "@/scheme";

class Query extends Schema<string> {
	public get() {
		return this.$get();
	}
	public set(value: Query["state"]) {
		this.$set(value);
	}
	public clear() {
		this.set("");
	}
}
export default (new Query(settings.query.input, Scheme.QUERY));
