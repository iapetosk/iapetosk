import * as React from "react";

import "./index.scss";

export type TitleBarState = {
	focus: boolean,
	restore: boolean,
	fullscreen: boolean;
};

class TitleBar extends React.Component<TitleBarState> {
	public state: TitleBarState;
	constructor(properties: TitleBarState) {
		super(properties);
		this.state = { ...properties };

		nw.Window.get().on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		nw.Window.get().on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		nw.Window.get().on("maximize", () => {
			this.setState({ ...this.state, restore: true });
		});
		nw.Window.get().on("restore", () => {
			this.setState({ ...this.state, restore: false, fullscreen: false });
		});
		nw.Window.get().on("enter-fullscreen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
	}
	public componentDidUpdate(): void {
		if (this.state.restore) {
			nw.Window.get().maximize();
		} else if (this.state.focus) {
			nw.Window.get().restore();
		}
	}
	public render(): JSX.Element {
		return (
			<section id="titlebar" class="contrast draggable">
				<button id="close" class="un_draggable"
					onClick={() => {
						nw.Window.get().close();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
				<button id="restore" class="un_draggable"
					onClick={() => {
						this.setState({ ...this.state, restore: !this.state.restore });
					}}
					dangerouslySetInnerHTML={{ __html: require(this.state.restore ? "!html-loader!@/assets/icons/minimize.svg" : "!html-loader!@/assets/icons/maximize.svg") }}>
				</button>
				<button id="focus" class="un_draggable"
					onClick={() => {
						nw.Window.get().minimize();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
			</section>
		);
	}
}
export default TitleBar;
