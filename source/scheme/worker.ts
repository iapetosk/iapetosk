import { Scheme, Schema } from "@/scheme";
import { Thread, Status } from "@/modules/download";

class Worker extends Schema<Thread[]> {
	public get(condition?: number | Status): Worker["state"] {
		return condition ? this.$get().filter((value) => { return typeof condition === typeof Status ? value.status === condition : value.id === condition; }) : this.$get();
	}
	public set(value: Worker["state"]): void {
		return this.$set(value);
	}
	public index(id: number, thread?: Thread): void {
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
export default (new Worker([], Scheme.WORKER));
