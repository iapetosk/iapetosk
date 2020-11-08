import * as React from "react";

import "./index.scss";

export type TitleBarState = {
	focus: boolean,
	restore: boolean,
	fullscreen: boolean;
};

class TitleBar extends React.Component<TitleBarState> {
	static readonly NWJS: NWJS_Helpers.win = nw.Window.get();
	public state: TitleBarState;
	constructor(properties: TitleBarState) {
		super(properties);
		this.state = { ...properties };

		TitleBar.NWJS.on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		TitleBar.NWJS.on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		TitleBar.NWJS.on("maximize", () => {
			this.setState({ ...this.state, restore: true });
		});
		TitleBar.NWJS.on("enter-fullscreen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		TitleBar.NWJS.on("restore", () => {
			this.setState({ ...this.state, restore: false, fullscreen: false });
		});
	}
	public componentDidUpdate(): void {
		if (this.state.restore) {
			TitleBar.NWJS.maximize();
		} else if (this.state.focus) {
			TitleBar.NWJS.restore();
		}
	}
	public render(): JSX.Element {
		return (
			<section id="titlebar" class="contrast draggable">
				<button id="focus" class="none-draggable"
					onClick={() => {
						TitleBar.NWJS.minimize();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
				<button id="restore" class="none-draggable"
					onClick={() => {
						this.setState({ ...this.state, restore: !this.state.restore });
					}}
					dangerouslySetInnerHTML={{ __html: require(this.state.restore ? "!html-loader!@/assets/icons/minimize.svg" : "!html-loader!@/assets/icons/maximize.svg") }}>
				</button>
				<button id="close" class="none-draggable"
					onClick={() => {
						TitleBar.NWJS.close();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
			</section>
		);
	}
}
export default TitleBar;
