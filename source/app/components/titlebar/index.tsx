import * as React from "react";
import { remote } from "electron";

import "./index.scss";

import utility from "@/modules/utility";

const $window = remote.getCurrentWindow();

export type TitleBarProps = {
	enable: boolean;
};
export type TitleBarState = {
	focus: boolean,
	maximize: boolean,
	fullscreen: boolean;
};

class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
	public props: TitleBarProps;
	public state: TitleBarState;
	constructor(props: TitleBarProps) {
		super(props);
		this.props = props;
		this.state = { focus: false, maximize: false, fullscreen: false };

		$window.on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		$window.on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		$window.on("maximize", () => {
			this.setState({ ...this.state, maximize: true });
		});
		$window.on("unmaximize", () => {
			this.setState({ ...this.state, maximize: false });
		});
		$window.on("enter-full-screen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		$window.on("leave-full-screen", () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	static getDerivedStateFromProps($new: TitleBarProps, $old: TitleBarProps) {
		return $new;
	}
	public render() {
		return (
			<section id="titlebar" class={utility.inline({ "draggable": true, "contrast": true, "enable": this.props.enable })}>
				<button id="focus" class="un_draggable"
					onClick={() => {
						$window.minimize();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
				<button id="maximize" class="un_draggable"
					onClick={() => {
						if (this.state.maximize) {
							$window.unmaximize();
						} else {
							$window.maximize();
						}
					}}
					dangerouslySetInnerHTML={{ __html: require(this.state.maximize ? "!html-loader!@/assets/icons/minimize.svg" : "!html-loader!@/assets/icons/maximize.svg") }}>
				</button>
				<button id="close" class="un_draggable"
					onClick={() => {
						$window.close();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
			</section>
		);
	}
}
export default TitleBar;
