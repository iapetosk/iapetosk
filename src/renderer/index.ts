import vue from "vue";
// @ts-ignore
import app from "@/renderer/app.vue";
// vuex
import store from "@/renderer/store/index";

new vue({
	// vuex
	store: store,
	// render
	render: (graphic) => {
		return graphic(app);
	}
}).$mount("#app");
