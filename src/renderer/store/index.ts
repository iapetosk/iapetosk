import vue from "vue";
import vuex from "vuex";

import thread from "./modules/thread";
import querybox from "./modules/querybox";

vue.use(vuex);

export default new vuex.Store({
	modules: {
		thread,
		querybox
	},
	strict: false
});
