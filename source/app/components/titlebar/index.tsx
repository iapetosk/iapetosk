import { ipcRenderer } from "electron";

import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";
import listener from "@/modules/listener";

import { ipcEvent } from "@/modules/listener";

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

		ipcRenderer.on(ipcEvent.FOCUS, () => {
			this.setState({ ...this.state, focus: true });
		});
		ipcRenderer.on(ipcEvent.BLUR, () => {
			this.setState({ ...this.state, focus: false });
		});
		ipcRenderer.on(ipcEvent.MAXIMIZE, () => {
			this.setState({ ...this.state, maximize: true });
		});
		ipcRenderer.on(ipcEvent.UNMAXIMIZE, () => {
			this.setState({ ...this.state, maximize: false });
		});
		ipcRenderer.on(ipcEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		ipcRenderer.on(ipcEvent.LEAVE_FULL_SCREEN, () => {
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
						ipcRenderer.send(ipcEvent.MINIMIZE);
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/focus.svg`) }}>
				</button>
				<button id="maximize" class="un_draggable"
					onClick={() => {
						if (this.state.maximize) {
							ipcRenderer.send(ipcEvent.UNMAXIMIZE);
						} else {
							ipcRenderer.send(ipcEvent.MAXIMIZE);
						}
					}}
					dangerouslySetInnerHTML={{ __html: require(this.state.maximize ? "!html-loader!@/assets/icons/minimize.svg" : "!html-loader!@/assets/icons/maximize.svg") }}>
				</button>
				<button id="close" class="un_draggable"
					onClick={() => {
						listener.emit(ipcEvent.BEFORE_CLOSE);
					}}
					dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/close.svg`) }}>
				</button>
			</section>
		);
	}
}
export default TitleBar;
