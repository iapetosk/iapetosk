import { Scheme, Schema } from "@/scheme";

class Router extends Schema<string[]> {
	public get(index?: number) {
		return this.$get()[index === undefined ? this.$get().length - 1 : index];
	}
	public set(value: Router["state"]) {
		this.$set(value);
	}
}
export default (new Router(["browser"], Scheme.ROUTER));
