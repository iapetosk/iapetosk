import { Component, Vue, Watch } from "vue-property-decorator";

@Component({})
export default class TitleBar extends Vue {
	readonly app = nw.Window.get();
	private focus: boolean = false;
	private restore: boolean = false;
	private fullscreen: boolean = false;
	created(): void {
		this.app.on("focus", () => {
			this.focus = true;
		});
		this.app.on("blur", () => {
			this.focus = false;
		});
		this.app.on("maximize", () => {
			this.restore = true;
		});
		this.app.on("enter-fullscreen", () => {
			this.fullscreen = true;
		});
		this.app.on("restore", () => {
			this.restore = false;
			this.fullscreen = false;
		});
	}
	@Watch("restore")
	private watch_restore($new: boolean): void {
		if ($new) {
			this.app.maximize();
		} else {
			this.app.restore();
		}
	}
}
