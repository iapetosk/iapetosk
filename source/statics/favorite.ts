import { StaticEvent, StaticHandler } from "@/statics";

import storage from "@/modules/storage";

import { StoragePreset } from "@/modules/storage";

class Favorite extends StaticHandler<Record<number, boolean>> {
	public get() {
		return this["state"];
	}
	public set($index: number, $new: boolean) {
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

				storage.set_data(StoragePreset.FAVORITE, Object.keys(this["state"]));
				break;
			}
		}
	}
}
// @ts-ignore
export default (new Favorite(Array.isArray(storage.get_data<object | number[]>(StoragePreset.FAVORITE)) ? storage.get_data<object | number[]>(StoragePreset.FAVORITE).reduce((map, value) => (map[value] = true, map), {}) : [], StaticEvent.FAVORITE));
