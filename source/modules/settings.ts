import storage from "@/modules/storage";
import template from "@/assets/config.json";

import { StoragePreset } from "@/modules/storage";

export type Config = {
	gallery: {
		resolution: "L" | "M" | "H",
		censorship: boolean,
		discovery: string[];
	},
	paging: {
		metre: number;
	},
	lazyload: {
		retry: number;
	},
	search: {
		query: string,
		per_page: number;
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
class Settings {
	private import = storage.get_data<Config>(StoragePreset.CONFIG);
	// @ts-ignore
	private settings: Config = {};
	constructor() {
		for (const section of Object.keys(template)) {
			// @ts-ignore
			if (this.import[section]) {
				// @ts-ignore
				for (const property of Object.keys(template[section])) {
					// @ts-ignore
					if (!this.settings[section]) {
						// @ts-ignore
						this.settings[section] = {};
					}
					// @ts-ignore
					if (this.import[section][property]) {
						// @ts-ignore
						this.settings[section][property] = this.import[section][property];
					} else {
						// @ts-ignore
						this.settings[section][property] = template[section][property];
					}
				}
			} else {
				// @ts-ignore
				this.settings[section] = template[section];
			}
		}
	}
	public get() {
		return { ...this.settings };
	}
	public set(key: keyof Config, value: Config[keyof Config]) {
		// @ts-ignore
		this.settings[key] = {
			...template[key],
			...value
		};
		storage.set_data(StoragePreset.CONFIG, this.settings);
	}
}
export default (new Settings());
