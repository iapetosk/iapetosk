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
	protected $get() {
		return this.state;
	}
	protected $set($new: state) {
		// backup
		const $old = this.$get();
		
		switch ($new) {
			case $old: {
				break;
			}
			default: {
				// assign
				this.state = $new;
				// debug
				console.log(this.event, $new, $old);
				// listener ($new, $old)
				listener.emit(this.event, $new, $old);
				break
			}
		}
	}
}
