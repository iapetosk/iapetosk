import * as React from "react";

import "@/renderer/components/styles/titlebar.scss";

export type TitleBarState = {
	focus: boolean,
	restore: boolean,
	fullscreen: boolean;
};

class TitleBar extends React.Component<TitleBarState, any> {
	readonly app = nw.Window.get();
	public state: TitleBarState;
	constructor(properties: TitleBarState) {
		super(properties);
		this.state = { ...properties };

		this.app.on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		this.app.on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		this.app.on("maximize", () => {
			this.setState({ ...this.state, restore: true });
		});
		this.app.on("enter-fullscreen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		this.app.on("restore", () => {
			this.setState({ ...this.state, restore: false, fullscreen: false });
		});
	}
	public componentDidUpdate(): void {
		if (this.state.restore) {
			this.app.maximize();
		} else if (this.state.focus) {
			this.app.restore();
		}
	}
	public render(): JSX.Element {
		return (
			<header id="titlebar" className="contrast draggable">
				<button id="focus" className="none-draggable"
					onClick={() => {
						this.app.minimize();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
				<button id="restore" className="none-draggable"
					onClick={() => {
						this.setState({ ...this.state, restore: !this.state.restore });
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/${this.state.restore ? `minimize` : `maximize`}.svg`) }}>
				</button>
				<button id="close" className="none-draggable"
					onClick={() => {
						this.app.close();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
			</header>
		);
	}
}
export default TitleBar;
