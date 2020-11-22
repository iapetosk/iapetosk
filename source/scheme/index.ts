import listener from "@/modules/listener";

export enum Scheme {
	QUERY = "query",
	ROUTER = "route",
	WORKER = "worker",
	PAGING = "paging",
	HISTORY = "history"
};
export class Schema<state> {
	private state: state;
	private event: Scheme;
	constructor(state: state, event: Scheme) {
		this.state = state;
		this.event = event;
	}
	protected $get(): state {
		return this.state;
	}
	protected $set(value: state): void {
		if (value !== this.$get()) {
			// listener (new, old)
			listener.emit(this.event, value, this.$get());
			// override
			this.state = value;
		}
	}
}
