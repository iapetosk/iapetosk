import Listener from "@/modules/listener";

import { Status, Thread } from "@/modules/download";

class Worker {
	private static state: Thread[] = [];
	public get(filter?: number | Status): typeof Worker.state {
		return filter ? Worker.state.filter((value) => { return typeof filter === typeof Status ? value.status === filter : value.id === filter; }) : Worker.state;
	}
	public set(value: typeof Worker.state) {
		// listener [new, old]
		Listener.emit("worker", value, Worker.state);
		// override
		Worker.state = value
	}
	public declare(id: number, thread?: Thread): void {
		let index: number = this.get().length;

		for (const [$index, value] of this.get().entries()) {
			switch (value.id) {
				case id: {
					index = $index;
					break;
				}
				default: {
					break;
				}
			}
		}
		this.set([...this.get().slice(0, index), ...(thread ? [thread] : []), ...this.get().slice(index + 1)]);
	}
}
export default (new Worker());
