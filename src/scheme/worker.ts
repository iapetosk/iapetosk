import listener from "@/modules/listener";
import { Thread } from "@/modules/download";

class Worker {
	private threads: {
		value: Thread[],
		readonly get: () => Worker["threads"]["value"],
		readonly set: (threads: Thread[]) => void,		
		readonly append: (thread: Thread) => void,
		readonly prepend: (thread: Thread) => void,
		readonly replace: (id: number, thread?: Thread) => void;
	} = {
		// initial value
		value: [],
		// functions
		get: (): Worker["threads"]["value"] => {
			return this.threads.value;
		},
		set: (threads: Thread[]): void => {
			this.threads.value = threads;
			listener.emit("worker_threads", threads);
		},
		append: (thread: Thread): void => {
			this.threads.set([...this.threads.get(), thread]);
		},
		prepend: (thread: Thread): void => {
			this.threads.set([thread, ...this.threads.get()]);
		},
		replace: (id: number, thread?: Thread): void => {
			for (let index: number = 0; index < this.threads.get().length; index++) {
				switch (this.threads.get()[index].id) {
					case id: {
						this.threads.set([...this.threads.get().slice(0, index), ...(thread ? [thread] : []), ...this.threads.get().slice(index + 1)]);
						break;
					}
				}
			}
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
