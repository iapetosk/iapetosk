import listener from "@/modules/listener";

export enum Scheme {
	QUERY = "query",
	SCROLL = "scroll",
	WORKER = "worker",
	GALLERY = "gallery"
};
export class Schema<type> {
	private state: type;
	private event: Scheme;
	constructor(init: type, event: Scheme) {
		this.state = init;
		this.event = event;
	}
	public $get(): type {
		return this.state;
	}
	public $set(value: type): void {
		// listener (new, old)
		listener.emit(this.event, value, this.$get());
		// override
		this.state = value;
	}
}
