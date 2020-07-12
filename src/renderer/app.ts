import { Component, Vue } from "vue-property-decorator";

import titlebar from "@/renderer/components/titlebar.vue";
import querybox from "@/renderer/components/querybox.vue";
import treeview from "@/renderer/components/treeview.vue";
import iterable from "@/renderer/components/iterable.vue";
import taskbar from "@/renderer/components/taskbar.vue";

import listener from "@/modules/listener";
import download from "@/modules/download";

@Component({
	components: {
		titlebar: titlebar,
		querybox: querybox,
		treeview: treeview,
		iterable: iterable,
		taskbar: taskbar
	}
})
export default class App extends Vue {
	created(): void {
		if (process.env.NODE_ENV === "development") {
			nw.Window.get().showDevTools();
		}
		listener.on("reload", () => {
			window.location.reload();
		});
	}
}