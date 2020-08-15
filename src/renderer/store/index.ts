import vue from "vue";
import vuex from "vuex";

import thread from "@/renderer/store/modules/thread";
import querybox from "@/renderer/store/modules/querybox";

vue.use(vuex);

export default new vuex.Store({
	modules: {
		thread,
		querybox
	},
	strict: false
});
