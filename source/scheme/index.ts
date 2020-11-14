import listener from "@/modules/listener";

export enum Scheme {
	QUERY = "query",
	ROUTER = "route",
	WORKER = "worker",
	PAGING = "paging",
	HISTORY = "history"
};
export class Schema<type> {
	private state: type;
	private event: Scheme;
	constructor(init: type, event: Scheme) {
		this.state = init;
		this.event = event;
	}
	protected $get(): type {
		return this.state;
	}
	protected $set(value: type): void {
		if (value !== this.$get()) {
			// listener (new, old)
			listener.emit(this.event, value, this.$get());
			// override
			this.state = value;
		}
	}
}
