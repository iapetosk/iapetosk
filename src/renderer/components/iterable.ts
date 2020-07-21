import { Component, Vue, Watch } from "vue-property-decorator";

import download, { Status, Thread } from "@/modules/download";
import utility from "@/modules/utility";

export type Grid = {
	title: string,
	from: string,
	status: Status,
	thread: Thread;
};

@Component({})
export default class Iterable extends Vue {
	private scroll_index: number = 0;
	private downloadable: Grid[] = new Array();
	created(): void {
		this.$store.commit("querybox/query", { value: "https://hitomi.la/galleries/1000.html https://hitomi.la/galleries/2000.html" });
	}
	private wheel(event: WheelEvent): void | boolean {
		this.scroll_index = utility.clamp(this.scroll_index + (event.deltaY > 0 ? 1 : -1), 0, this.downloadable.length - 1);
	}
	private adjust_scroll(): void {
		const target: HTMLElement = document.getElementById("scroll_area")!;

		const height: number = utility.truncate(target.scrollHeight / this.downloadable.length);

		let start: number = (target.scrollTop) / height;
		let finish: number = (target.scrollTop + target.clientHeight) / height;
		let ranging: number = finish - start;

		target.scroll(0, height * (this.scroll_index - Math.floor(ranging / 2)));
	}
	private status_colour(status: Status): undefined | "success" | "warning" | "error" {
		switch (status) {
			case Status.NONE:
			case Status.REMOVED:
			case Status.PROGRESS: {
				return undefined;
			}
			case Status.FINISHED: {
				return "success";
			}
			case Status.QUEUED: {
				return "warning";
			}
			case Status.ERROR: {
				return "error";
			}
		}
	}
	@Watch("scroll_index")
	private watch_scroll_index(): void {
		this.adjust_scroll();
	}
	@Watch("downloadable")
	private watch_downloadable(): void {
		this.scroll_index = utility.clamp(this.scroll_index, 0, this.downloadable.length - 1);
	}
	@Watch("$store.state.querybox.query")
	private $store_state_querybox_query($new: string): void {
		if ($new && $new.length) {
			$new.split(/\s+/).forEach((value) => {
				download.modulator(value).then((callback) => {
					download.start(callback.files, callback.options).then((callback_second) => {
						this.downloadable.push({
							title: value,
							from: value,
							...callback_second
						});
					});
				});
			});
			this.$store.dispatch("querybox/clear");
		}
	}
}
