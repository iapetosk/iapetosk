import * as React from "react";
import { remote } from "electron";

import "./index.scss";

import utility from "@/modules/utility";

export type TitleBarState = {
	disable: boolean,
	focus: boolean,
	maximize: boolean,
	fullscreen: boolean;
};

const $window = remote.getCurrentWindow();

class TitleBar extends React.Component<TitleBarState> {
	public state: TitleBarState;
	constructor(properties: TitleBarState) {
		super(properties);
		this.state = { ...properties };
	}
	static getDerivedStateFromProps($new: TitleBarState, $old: TitleBarState) {
		return $new;
	}
	public render() {
		return (
			<section id="titlebar" class={utility.inline({ "draggable": true, "contrast": true, "disable": this.state.disable })}>
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
