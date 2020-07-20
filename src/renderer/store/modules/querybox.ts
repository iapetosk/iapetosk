class QueryBox {
	public query: string = "";
};
// getters | getters
const getters = {
	query: (state: QueryBox): QueryBox["query"] => {
		return state.query;
	}
};
// actions | dispatch
const actions = {
	clear: (state: { commit: Function }): void => {
		state.commit("query", "");
	}
};
// mutations | commit
const mutations = {
	query: (state: QueryBox, options: { value: QueryBox["query"] }): void => {
		state.query = options.value;
	}
};
export default {
	namespaced: true,
	state: new QueryBox(),
	getters,
	actions,
	mutations
};
