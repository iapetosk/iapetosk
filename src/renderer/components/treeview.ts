import { Component, Vue, Watch } from "vue-property-decorator";
import { Thread } from "@/modules/download";
import request from "@/modules/request";
import utility from "@/modules/utility";

@Component({})
export default class TreeView extends Vue {
	public treeview: {
		[key: string]: {
			favicon: string,
			list: string[],
			show: boolean
		}
	} = {};
	created(): void {
	}
	@Watch("$store.state.thread.list")
	private async watch_$store_state_thread_list($new: Thread[]): Promise<void> {
		const treeview: TreeView["treeview"] = {};

		for (const thread of $new) {
			const hostname = thread.from.replace(/https?:\/\/(www.)?/, "").split("/")[0];

			if (treeview[hostname]) {
				treeview[hostname].list.push(thread.from);
			} else if (this.treeview[hostname]) {
				treeview[hostname] = {
					...this.treeview[hostname],
					list: [thread.from]
				}
			} else {
				treeview[hostname] = {
					favicon: await request.get(hostname).then((callback) => { return utility.parser(callback.body, "link[rel=\"icon\"]", "href")[0] }),
					list: [thread.from],
					show: false
				};
			}
		}
		this.treeview = treeview;
	}
}
