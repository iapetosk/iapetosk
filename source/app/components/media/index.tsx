import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import read from "@/modules/hitomi/read";
import utility from "@/modules/utility";
import storage from "@/modules/storage";
import router from "@/statics/router";

import { BridgeEvent } from "@/common";
import { StaticEvent } from "@/statics";
import { Task } from "@/modules/download";
import { Viewport } from "@/statics/router";
import { GalleryJS } from "@/modules/hitomi/read";

export type MediaProps = {};
export type MediaState = {
	script?: GalleryJS,
	fullscreen: boolean;
};

class Media extends React.Component<MediaProps, MediaState> {
	public props: MediaProps;
	public state: MediaState;
	constructor(props: MediaProps) {
		super(props);
		this.props = props;
		this.state = { script: undefined, fullscreen: false };

		window.static.on(StaticEvent.ROUTER, (args) => {
			const [$new, $old] = args as [Viewport, Viewport];

			switch ($new.view) {
				case "reader": {
					this.setState({ ...this.state, script: undefined });
					break;
				}
				default: {
					break;
				}
			}
			read.script($new.options as number).then((script) => {
				this.setState({ ...this.state, script: script });
			});
		});
		window.bridge.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	public render() {
		const task: Task | undefined = storage.get_data(String(this.state.script?.id));
		return (
			<section id="media">
				<section id="navigation" class={utility.inline({ "enable": !this.state.fullscreen, "contrast": true, "center-x": true })}>
					{[
						{
							HTML: require(`!html-loader!@/assets/icons/return.svg`),
							click: () => {
								router.set({ view: "browser", options: undefined });
							}
						},
						{
							HTML: require(`!html-loader!@/assets/icons/copy.svg`),
							click: () => {
								navigator.clipboard.writeText(`https://hitomi.la/galleries/${this.state.script?.id}.html`);
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
					{this.state.script?.files.map((file, index) => {
						return (
							<LazyLoad src={task && task.files[index].size === task.files[index].written ? `${window.API.isPackaged() ? "" : `${window.API.getPath()}/`}../${task.files[index].path}` : file.url} width={file.width} height={file.height} key={index}></LazyLoad>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Media;
