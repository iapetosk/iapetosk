import storage from "@/modules/storage";

import { StoragePreset } from "@/modules/storage";

export type Configure = {
	download: {
		max_threads: number,
		max_working: number,
		rules: Record<string, {
			placeholder: string;
		}>;
	},
	request: {
		max_redirects: number;
	};
};
