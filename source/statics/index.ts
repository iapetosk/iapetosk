import listener from "@/modules/listener";

export enum Static {
	ROUTER = "route",
	WORKER = "worker"
};
export class StaticHandler<state> {
	private state: state;
	private event: Static;
	constructor(state: state, event: Static) {
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
