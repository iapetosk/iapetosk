import listener from "@/modules/listener";

import { Scheme, Schema } from "@/scheme";
import { Task } from "@/modules/download";

class Worker extends Schema<Record<string, Task>> {

	public get(key: number) {
		return this["state"][key];
	}
	public set($index: number, $new: Task | undefined) {
		// backup
		const $old = this["state"][$index];

		switch ($new) {
			case $old: {
				break;
			}
			default: {
				// assign
				if ($new) {
					this["state"][$index] = $new;
				} else {
					delete this["state"][$index];
				}
				// debug
				console.log(this["event"], $index, $new, $old);
				// listener ($index, $new, $old)
				listener.emit(this["event"], $index, $new, $old);
				break;
			}
		}
	}
	public filter(condition?: { key: "id" | "from" | "title" | "files" | "status" | "options" | "working" | "finished", value: any; }) {
		return condition ? Object.values(this["state"]).filter((task) => { return task[condition.key] == condition.value; }) : Object.values(this["state"]);
	}
}
export default (new Worker({}, Scheme.WORKER));
