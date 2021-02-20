import * as React from "react";

import "./index.scss";

import Button from "@/app/components/button";
import LazyLoad from "@/app/components/lazyload";

import utility from "@/modules/utility";
import router from "@/statics/router";

import { BridgeEvent, CommonProps } from "@/common";

export type MediaProps = CommonProps & {
	options: {
		files: string[];
	};
};
export type MediaState = {
	fullscreen: boolean;
};

class MediaPlayer extends React.Component<MediaProps, MediaState> {
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
			<section data-component="media.player" id={this.props.id} class={utility.inline({ ...this.props.class })}>
				<section id="navigation" class={utility.inline({ "enable": !this.state.fullscreen, "contrast": true, "center-x": true })}>
					{[
						{
							html: require(`@/assets/icons/return.svg`),
							click: () => {
								router.set({ view: "browser", options: undefined });
							}
						}
					].map(({ html, click }, index) => {
						return (
							<Button key={index}
								handler={{
									click: () => {
										click();
									}
								}}
							>{html}</Button>
						);
					})}
				</section>
				<section id="scrollable" class="scroll-y">
					{this.props.options.files.map((file, index) => {
						return (
							<LazyLoad options={{ source: file }} class={{ "contrast": true }} key={index}></LazyLoad>
						);
					})}
				</section>
			</section>
		);
	}
}
export default MediaPlayer;
