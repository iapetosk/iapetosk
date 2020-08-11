import { Status, File } from "@/modules/download";
export type Resource = {
	from: string,
	title: string,
	files: File[],
	status: Status
};
class Download {
	public list: Resource[] = [];
};
// getters | getters
const getters = {
	list: (state: Download): Download["list"] => {
		return state.list;
	}
};
// actions | dispatch
const actions = {
	append: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Resource; }): void => {
		state.commit("list", {
			value: [
				...state.getters["list"] as Resource[],
				options.value
			]
		});
	},
	prepend: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Resource; }): void => {
		state.commit("list", {
			value: [
				options.value,
				...state.getters["list"] as Resource[]
			]
		});
	},
	insert: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Resource, index: number; }): void => {
		state.commit("list", {
			value: [
				...(state.getters["list"] as Resource[]).slice(0, options.index),
				options.value,
				...(state.getters["list"] as Resource[]).slice(options.index + 1),
			].filter((value) => {
				return value;
			})
		});
	}
};
// mutations | commit
const mutations = {
	list: (state: Download, options: { value: Download["list"]; }): void => {
		state.list = options.value;
	}
};
export default {
	namespaced: true,
	state: new Download(),
	getters,
	actions,
	mutations
};
