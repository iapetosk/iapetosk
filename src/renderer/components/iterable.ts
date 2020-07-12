import { Component, Vue, Watch } from "vue-property-decorator";

import download, { File } from "@/modules/download";
import utility from "@/modules/utility";

export type BlockPanel = {
	title: string,
	from: string,
	date: number,
	files: File[];
};

@Component({})
export default class Iterable extends Vue {
	private scroll_index: number = 0;
	private downloadable: BlockPanel[] = new Array();
	created(): void {
		for (let index: number = 0; index < 5; index++) {
			this.downloadable.push({
				title: `Black Butler - Chapter ${index} / English`,
				from: "unknown",
				date: index,
				files: []
			});
		}
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

		target.scroll(0, height * (this.scroll_index - Math.round(ranging / 2)));
	}
	@Watch("scroll_index")
	private watch_scroll_index(): void {
		this.adjust_scroll();
	}
	@Watch("downloadable")
	private watch_downloadable(): void {
		this.scroll_index = utility.clamp(this.scroll_index, 0, this.downloadable.length - 1);
	}
}
