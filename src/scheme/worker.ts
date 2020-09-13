import listener from "@/modules/listener";
import { Status, Thread } from "@/modules/download";

class Worker {
	private threads: {
		value: Thread[],
		readonly get: (status?: Status) => Worker["threads"]["value"],
		readonly set: (threads: Worker["threads"]["value"]) => void,
		readonly declare: (id: number, thread?: Thread) => void;
	} = {
		// initial
		value: [],
		// functions
		get: (status?: Status): Worker["threads"]["value"] => {
			return status ? this.threads.value.filter((value) => { return value.status === status; }) : this.threads.value;
		},
		set: (threads: Worker["threads"]["value"]): void => {
			// listener [new, old]
			listener.emit("worker.threads", threads, this.threads.value);
			// override
			this.threads.value = threads;
		},
		declare: (id: number, thread?: Thread): void => {
			let $index: number = this.threads.get().length;

			for (const [index, value] of this.threads.get().entries()) {
				switch (value.id) {
					case id: {
						$index = index;
						break;
					}
					default: {
						break;
					}
				}
			}
			this.threads.set([...this.threads.get().slice(0, $index), ...(thread ? [thread] : []), ...this.threads.get().slice($index + 1)]);
		}
	};
	constructor() {
	}
	/* AUTO GENERATED RETURN TYPE */
	public index(property: "threads") {
		return this[property];
	}
}
export default (new Worker());
