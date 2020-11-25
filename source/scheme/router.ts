import { Scheme, Schema } from "@/scheme";

class Router extends Schema<string[]> {
	public get() {
		return this.$get();
	}
	public set(value: Router["state"]) {
		return this.$set(value);
	}
	public index(index?: number) {
		return this.get()[index === undefined ? this.get().length - 1 : index];
	}
}
export default (new Router(["browser"], Scheme.ROUTER));
