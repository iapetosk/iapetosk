import listener from "@/modules/listener";
import { Thread } from "@/modules/download";

class Worker {
	private threads: Thread[] = [];
	constructor() {
	}
	/* AUTO GENERATED RETURN TYPE */
	public get(property: "threads") {
		return this[property];
	}
	public set(property: "threads", value: any): void {
		this[property] = value;
		listener.emit(`worker_${property}`, value);
	}
	/* FOLLOWING FUNCTIONS ARE FOR PROPERTY "THREADS" */
	public append(thread: Thread): void {
		this.set("threads", [...this.threads, thread]);
	}
	public prepend(thread: Thread): void {
		this.set("threads", [thread, ...this.threads]);
	}
	public replace(thread: Thread, id: number): void {
		for (let index: number = 0; index < this.threads.length; index++) {
			switch (this.threads[index].id) {
				case id: {
					this.set("threads", [...this.threads.slice(0, index), thread, ...this.threads.slice(index + 1)]);
					break;
				}
			}
		}
	}
}
export default (new Worker());
