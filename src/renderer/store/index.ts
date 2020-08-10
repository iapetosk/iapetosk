import vue from "vue";
import vuex from "vuex";

import querybox from "./modules/querybox";
import download from "./modules/download";

vue.use(vuex);

export default new vuex.Store({
	modules: {
		querybox,
		download
	},
	strict: false
});
