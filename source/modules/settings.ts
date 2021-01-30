import storage from "@/modules/storage";

import { StoragePreset } from "@/modules/storage";

export type Configure = {
	browser: {
		resolution: "lowest" | "medium" | "highest",
		censor: boolean;
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
const boilerplate: Configure = {
	browser: {
		resolution: "lowest",
		censor: true
	},
	query: {
		input: ""
	},
	iterable: {
		discovery: [
			"type",
			"title",
			"language",
			"character",
			"artist",
			"series",
			"group",
			"tags",
			"date"
		]
	},
	paging: {
		metre: 10,
	},
	hitomi: {
		per_page: 25
	},
	request: {
		max_redirects: 10
	},
	storage: {
		auto_save: 1000 * 60 * 5
	},
	download: {
		folder: "{id}",
		directory: "./download",
		max_threads: 5,
		max_working: 5
	}
},
	settings: Configure = storage.get_data(StoragePreset.SETTINGS);

function recursive($new: Record<string, any>, $old: Record<string, any>) {
	for (const key of Object.keys($new)) {
		if ($old[key] === undefined) {
			if ($new[key].constructor.name === "Object") {
				$old[key] = {};
			} else {
				$old[key] = $new[key];
			}
		} if ($old[key].constructor.name === "Object") {
			recursive($new[key], $old[key]);
		}
	}
}
recursive(boilerplate, settings);

export default new Proxy(settings, {
	set(target: Configure, key: never, value: never) {
		// update property
		target[key] = value;
		// update storage
		storage.set_data(StoragePreset.SETTINGS, target);
		// approve
		return true;
	}
});
