import { Task } from "@/modules/download";
import { StaticEvent, StaticHandler } from "@/statics";

class Worker extends StaticHandler<Record<string, Task>> {
	public get() {
		return this["state"];
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
				console.log(this["event"], [$index, $new, $old]);
				// listener [$index, $new, $old]
				window.static.emit(this["event"], [$index, $new, $old]);
				break;
			}
		}
	}
}
export default (new Worker({}, StaticEvent.WORKER));
