import { Thread } from "@/modules/download";
import utility from "@/modules/utility";
class Worker {
	public list: Thread[] = [];
};
// getters | getters
const getters = {
	list: (state: Worker): Worker["list"] => {
		return state.list;
	}
};
// actions | dispatch
const actions = {
	append: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Thread; }): void => {
		state.commit("list", {
			value: [
				...state.getters["list"] as Thread[],
				options.value
			]
		});
	},
	prepend: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Thread; }): void => {
		state.commit("list", {
			value: [
				options.value,
				...state.getters["list"] as Thread[]
			]
		});
	},
	update: (state: { commit: Function, getters: { [key: string]: any; }; }, options: { value: Thread, id: number; }): void => {
		const index: number = utility.index_of(state.getters["list"] as Thread[], options.value);

		state.commit("list", {
			value: [
				...(state.getters["list"] as Thread[]).slice(0, index),
				options.value,
				...(state.getters["list"] as Thread[]).slice(index + 1),
			].filter((value) => {
				return value;
			})
		});
	}
};
// mutations | commit
const mutations = {
	list: (state: Worker, options: { value: Worker["list"]; }): void => {
		state.list = options.value;
	}
};
export default {
	namespaced: true,
	state: new Worker(),
	getters,
	actions,
	mutations
};
