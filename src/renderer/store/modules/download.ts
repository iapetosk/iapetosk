import { Status, Thread } from "@/modules/download";
export type Grid = {
	from: string,
	title: string,
	status: Status,
	thread: Thread;
};
class Download {
	public list: Grid[] = [];
};
// getters | getters
const getters = {
	list: (state: Download): Download["list"] => {
		return state.list;
	}
};
// actions | dispatch
const actions = {
	append: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Grid; }): void => {
		state.commit("list", {
			value: [
				...state.getters["list"] as Grid[],
				options.value
			]
		});
	},
	prepend: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Grid; }): void => {
		state.commit("list", {
			value: [
				options.value,
				...state.getters["list"] as Grid[]
			]
		});
	},
	insert: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Grid, index: number; }): void => {
		state.commit("list", {
			value: [
				...(state.getters["list"] as Grid[]).slice(0, options.index),
				options.value,
				...(state.getters["list"] as Grid[]).slice(options.index + 1),
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
