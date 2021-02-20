import * as React from "react";

import "./index.scss";

import Button from "@/app/components/button";

import utility from "@/modules/utility";

import { BridgeEvent, API_COMMAND, CommonProps } from "@/common";

export type TitleBarProps = CommonProps & {
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
		this.state = {
			focus: false,
			maximize: false,
			fullscreen: false
		};
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
			<section data-component="titlebar" id={this.props.id} class={utility.inline({ "enable": this.props.enable, "contrast": true, "draggable": true, ...this.props.class })}>
				{[
					{
						id: "focus",
						html: require(`@/assets/icons/focus.svg`),
						click: () => {
							window.API(API_COMMAND.MINIMIZE);
						}
					},
					{
						id: "maximize",
						html: this.state.maximize ? require(`@/assets/icons/minimize.svg`) : require(`@/assets/icons/maximize.svg`),
						click: () => {
							if (this.state.maximize) {
								window.API(API_COMMAND.UNMAXIMIZE);
							} else {
								window.API(API_COMMAND.MAXIMIZE);
							}
						}
					},
					{
						id: "close",
						html: require(`@/assets/icons/close.svg`),
						click: () => {
							window.bridge.emit(BridgeEvent.BEFORE_CLOSE);
						}
					}
				].map(({ id, html, click }, index) => {
					return (
						<Button id={id} class={{ "un_draggable": true }} key={index}
							handler={{
								click: () => {
									click();
								}
							}}
						>{html}</Button>
					);
				})}
			</section>
		);
	}
}
export default TitleBar;
