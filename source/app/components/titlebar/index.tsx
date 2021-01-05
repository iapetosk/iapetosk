import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { BridgeEvent } from "@/common";

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

		window.bridge.on(BridgeEvent.FOCUS, () => {
			this.setState({ ...this.state, focus: true });
		});
		window.bridge.on(BridgeEvent.BLUR, () => {
			this.setState({ ...this.state, focus: false });
		});
		window.bridge.on(BridgeEvent.MAXIMIZE, () => {
			this.setState({ ...this.state, maximize: true });
		});
		window.bridge.on(BridgeEvent.UNMAXIMIZE, () => {
			this.setState({ ...this.state, maximize: false });
		});
		window.bridge.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	static getDerivedStateFromProps($new: TitleBarProps, $old: TitleBarProps) {
		return $new;
	}
	public render() {
		return (
			<section id="titlebar" class={utility.inline({ "enable": this.props.enable, "draggable": true, "contrast": true })}>
				<button id="focus" class="un_draggable"
					onClick={() => {
						window.API.minimize();
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
				<button id="maximize" class="un_draggable"
					onClick={() => {
						if (this.state.maximize) {
							window.API.unmaximize();
						} else {
							window.API.maximize();
						}
					}}
					dangerouslySetInnerHTML={{ __html: require(this.state.maximize ? "!html-loader!@/assets/icons/minimize.svg" : "!html-loader!@/assets/icons/maximize.svg") }}>
				</button>
				<button id="close" class="un_draggable"
					onClick={() => {
						window.bridge.emit(BridgeEvent.BEFORE_CLOSE);
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
			</section>
		);
	}
}
export default TitleBar;
