import { Component, Vue, Watch } from "vue-property-decorator";

import utility from "@/modules/utility";

@Component({})
export default class Iterable extends Vue {
	private scroll_index: number = 0;
	private downloadable: Object[] = new Array();
	created(): void {
		for (let index: number = 0; index < 100; index++) {
			this.downloadable[index] = {
				title: index
			};
		}
	}

	private wheel(event: WheelEvent): void | boolean {
		this.scroll_index = utility.clamp(this.scroll_index + (event.deltaY > 0 ? 1 : -1), 0, this.downloadable.length - 1);
	}

	private adjust_scroll(): void {
		const target: HTMLElement = document.getElementById("scroll_area")!;

		const height: number = Math.round(target.scrollHeight / this.downloadable.length);

		let start: number = Math.round(target.scrollTop) / height;
		let finish: number = Math.round(target.scrollTop + target.clientHeight) / height;

		target.scroll(0, height * (this.scroll_index - Math.round((finish - start) / 2)));

		// console.log("range", finish - start, "start", start, "finish", finish, "index", this.scroll_index);
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