import { Component, Vue, Watch } from "vue-property-decorator";
import request from "@/modules/request";
import utility from "@/modules/utility";
import { Thread } from "@/modules/download";

@Component({})
export default class TreeView extends Vue {
	public treeview: {
		[key: string]: {
			favicon: string,
			active: boolean,
			list: number[];
		};
	} = {};
	created(): void {
		this.treeview_update(this.$store.getters["thread/list"] as Thread[]);
	}
	public async treeview_update(worker: Thread[]) {
		const treeview: TreeView["treeview"] = {};

		for (const thread of worker) {
			const hostname = thread.from.replace(/https?:\/\/(www.)?/, "").split(/\//)[0];

			if (treeview[hostname]) {
				treeview[hostname].list = [
					...treeview[hostname].list,
					thread.id
				];
			} else if (this.treeview[hostname]) {
				treeview[hostname] = {
					...this.treeview[hostname],
					list: [thread.id]
				};
			} else {
				treeview[hostname] = {
					favicon: await request.get(`https://${hostname}`).then((callback) => {
						const icon = {
							default: utility.parse(callback.content.encode, "link[rel=\"icon\"]", "href"),
							shortcut: utility.parse(callback.content.encode, "link[rel=\"shortcut icon\"]", "href")
						};
						return favicon(hostname, icon.default.length ? icon.default : icon.shortcut);
					}),
					active: false,
					list: [thread.id]
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
function favicon(hostname: string, value: string | string[]): string {
	let url: string = value instanceof Array ? value[0] : value;

	if (url) {
		url = url.startsWith("//") ? url : [hostname, url].join("/");
		url = url.startsWith("http") || url.startsWith("https") ? url : `https://${url}`;
	}

	return url;
}
