import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import utility from "@/modules/utility";
import router from "@/statics/router";

import { BridgeEvent } from "@/common";

export type MediaProps = {
	files: string[];
};
export type MediaState = {
	fullscreen: boolean;
};

class Media extends React.Component<MediaProps, MediaState> {
	public props: MediaProps;
	public state: MediaState;
	constructor(props: MediaProps) {
		super(props);
		this.props = props;
		this.state = {
			fullscreen: false
		};

		window.bridge.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	public render() {
		return (
			<section id="media">
				<section id="navigation" class={utility.inline({ "enable": !this.state.fullscreen, "contrast": true, "center-x": true })}>
					{[
						{
							HTML: require(`!html-loader!@/assets/icons/return.svg`),
							click: () => {
								router.set({ view: "browser", options: undefined });
							}
						}
					].map((button, index) => {
						return (
							<button key={index}
								onClick={() => {
									button.click();
								}}
								dangerouslySetInnerHTML={{ __html: button.HTML }}>
							</button>
						);
					})}
				</section>
				<section id="scrollable" class="scroll-y">
					{this.props.files.map((file, index) => {
						return (
							<LazyLoad src={file} key={index}></LazyLoad>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Media;
