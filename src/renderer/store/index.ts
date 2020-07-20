import vue from "vue";
import vuex from "vuex";

import querybox from "./modules/querybox";

vue.use(vuex);

export default new vuex.Store({
	modules: {
		querybox
	},
	strict: false
});
