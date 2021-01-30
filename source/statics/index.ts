export enum StaticEvent {
	ROUTER = "route",
	WORKER = "worker"
};
export class StaticHandler<state> {
	private state: state;
	private event: StaticEvent;
	constructor(state: state, event: StaticEvent) {
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
				console.log(this.event, [$new, $old]);
				// listener [$new, $old]
				window.static.emit(this.event, [$new, $old]);
				break;
			}
		}
	}
}
