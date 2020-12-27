import { StaticEvent, StaticHandler } from "@/statics";

export type Viewport = {
	view: string,
	options: any
};

class Router extends StaticHandler<Viewport> {
	public get() {
		return this.$get();
	}
	public set(value: Router["state"]) {
		this.$set(value);
	}
}
export default (new Router({ view: "browser", options: undefined }, StaticEvent.ROUTER));
