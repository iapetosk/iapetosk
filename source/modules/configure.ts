import storage from "@/modules/storage";

import { StoragePreset } from "@/modules/storage";

export type Configure = {
	browser: {
		resolution: "low" | "medium" | "high",
		censor: boolean;
	},
	reader: {
		lazy: boolean;
	},
	paging: {
		size: number;
	},
	hitomi: {
		per_page: number;
	},
	request: {
		max_redirects: number;
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
		resolution: "low",
		censor: true
	},
	reader: {
		lazy: true
	},
	paging: {
		size: 10,
	},
	hitomi: {
		per_page: 25
	},
	request: {
		max_redirects: 10
	},
	download: {
		folder: "{id}",
		directory: "./download",
		max_threads: 5,
		max_working: 5
	}
};
