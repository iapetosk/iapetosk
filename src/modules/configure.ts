import storage from "@/modules/storage";
import { StoragePreset } from "@/modules/storage";

export type Configure = {
	max_threads: number,
	max_yields: number,
	rules: {
		[key: string]: {
			placeholder: string;
		};
	};
};
const reforged: Configure = storage.get_data(StoragePreset.SETTINGS);
const unforged: Configure = {
	max_threads: 10,
	max_yields: 10,
	rules: {
		"hitomi.la": {
			placeholder: "<id>"
		}
	}
};
function override(from: { [key: string]: any }, to: { [key: string]: any }): void {
	for (const key of Object.keys(from)) {
		if (to[key] === undefined) {
			if (from[key].constructor.name === "Object") {
				to[key] = {};
			} else {
				to[key] = from[key];
			}
		}  if (to[key].constructor.name === "Object") {
			override(from[key], to[key]);
		}
	}
}

override(unforged, reforged);

export {
	reforged,
	unforged
}
