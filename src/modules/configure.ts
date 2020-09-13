import storage from "@/modules/storage";
import { StoragePreset } from "@/modules/storage";

export type Configure = {
	max_threads: number,
	max_working: number,
	rules: {
		[key: string]: {
			placeholder: string;
		};
	};
};
