import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import read from "@/modules/hitomi/read";
import utility from "@/modules/utility";
import worker from "@/statics/worker";
import router from "@/statics/router";

import { BridgeEvent } from "@/common";
import { StaticEvent } from "@/statics";
import { Viewport } from "@/statics/router";

export type MediaProps = {};
export type MediaState = {
	files: string[],
	fullscreen: boolean;
};

class Media extends React.Component<MediaProps, MediaState> {
	public props: MediaProps;
	public state: MediaState;
	constructor(props: MediaProps) {
		super(props);
		this.props = props;
		this.state = { files: [], fullscreen: false };

		window.static.on(StaticEvent.ROUTER, (args) => {
			const [$new, $old] = args as [Viewport, Viewport];

			switch ($new.view) {
				case "reader": {
					this.setState({ ...this.state, files: [] });
					break;
				}
				default: {
					break;
				}
			}
			read.script($new.options as number).then(async (script) => {
				const files = [];

				for (let index = 0; index < script.files.length; index++) {
					if (worker.get()[script.id] && worker.get()[script.id].files[index].written === worker.get()[script.id].files[index].size) {
						if (await window.API.is_packaged().then((packaged) => { return packaged; })) {
							files.push(`${await window.API.get_path().then((path) => { return path; })}/${worker.get()[script.id]?.files[index].path}`);
						} else {
							files.push(`../${worker.get()[script.id]?.files[index].path}`);
						}
					} else {
						files.push(script.files[index].url);
					}
				}
				this.setState({ ...this.state, files: files });
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
					{this.state.files.map((file, index) => {
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
