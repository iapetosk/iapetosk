import { Scheme, Schema } from "@/scheme";

export type Layer = {
	view: string,
	options: any
};

class Router extends Schema<Layer> {
	public get() {
		return this.$get();
	}
	public set(value: Router["state"]) {
		this.$set(value);
	}
}
export default (new Router({ view: "browser", options: undefined }, Scheme.ROUTER));
