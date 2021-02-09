export enum StaticEvent {
	ROUTER = "route",
	WORKER = "worker"
};
export class StaticHandler<State> {
	private state: State;
	private event: StaticEvent;
	constructor(state: State, event: StaticEvent) {
		this.state = state;
		this.event = event;
	}
	protected $get() {
		return this.state;
	}
	protected $set($new: State) {
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
