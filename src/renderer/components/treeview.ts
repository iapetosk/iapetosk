import { Component, Vue, Watch } from "vue-property-decorator";
import { Thread } from "@/modules/download";
import request from "@/modules/request";
import utility from "@/modules/utility";

function favicon(hostname: string, value: string | string[]): string {
	const url: string = value instanceof Array ? value[0] : value;

	return /^\/\//.test(url) ? url : hostname + url;
}

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
		this.treeview_update(this.$store.getters["thread/list"] as Thread[]);
	}
	public async treeview_update(worker: Thread[]) {
		const treeview: TreeView["treeview"] = {};

		for (const thread of worker) {
			const hostname = thread.from.replace(/https?:\/\/(www.)?/, "").split(/\//)[0];

			if (treeview[hostname]) {
				treeview[hostname].list.push(thread.from);
			} else if (this.treeview[hostname]) {
				treeview[hostname] = {
					...this.treeview[hostname],
					list: [thread.from]
				}
			} else {
				treeview[hostname] = {
					favicon: await request.get(`https://${hostname}`).then((callback) => { return favicon(hostname, utility.parser(callback.body, "link[rel=\"icon\"]", "href")); }),
					list: [thread.from],
					show: false
				};
			}
		}
		this.treeview = treeview;
	}
	@Watch("$store.state.thread.list")
	private async watch_$store_state_thread_list($new: Thread[]): Promise<void> {
		this.treeview_update($new);
	}
}
