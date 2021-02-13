import storage from "@/modules/storage";
import template from "@/assets/config.json";

import { StoragePreset } from "@/modules/storage";

export type Config = {
	browser: {
		resolution: "L" | "M" | "H",
		censorship: boolean;
	},
	query: {
		input: string;
	},
	iterable: {
		discovery: string[];
	},
	paging: {
		metre: number;
	},
	hitomi: {
		per_page: number;
	},
	request: {
		max_redirects: number;
	},
	storage: {
		auto_save: number;
	},
	download: {
		folder: string,
		directory: string,
		max_threads: number,
		max_working: number;
	};
};
const settings: Config = storage.get_data(StoragePreset.CONFIG);

function recursive($new: Record<string, any>, $old: Record<string, any>) {
	for (const key of Object.keys($new)) {
		if ($old[key] === undefined) {
			if ($new[key].constructor.name === "Object") {
				$old[key] = {};
			} else {
				$old[key] = $new[key];
			}
		}
		if ($old[key].constructor.name === "Object") {
			recursive($new[key], $old[key]);
		}
	}
}
recursive(template, settings);

export default new Proxy(settings, {
	set(target: Config, key: never, value: never) {
		// update property
		target[key] = value;
		// update storage
		storage.set_data(StoragePreset.CONFIG, target);
		// approve
		return true;
	}
});
