import * as React from "react";

import "./index.scss";

import MediaPlayer from "@/app/components/media.player";

import DiscordRPC from "@/modules/discord.rpc";

import utility from "@/modules/utility";
import worker from "@/statics/worker";
import read, { GalleryJS } from "@/modules/hitomi/read";

import { API_COMMAND } from "@/common";
import { StaticEvent } from "@/statics";
import { MediaProps } from "@/app/components/media.player";
import { Viewport } from "@/statics/router";

export type ViewerProps = {
	enable: boolean;
};
export type ViewerState = {
	script?: GalleryJS,
	media: MediaProps;
};

class Viewer extends React.Component<ViewerProps> {
	public props: ViewerProps;
	public state: ViewerState;
	constructor(props: ViewerProps) {
		super(props);
		this.props = props;
		this.state = {
			script: undefined,
			media: {
				options: {
					files: []
				}
			}
		};

		window.static.on(StaticEvent.ROUTER, (args) => {
			const [$new, $old] = args as [Viewport, Viewport];

			switch ($new.view) {
				case "viewer": {
					this.setState({ ...this.state, script: undefined, media: { ...this.state.media, options: { ...this.state.media.options, files: [] } } });
					read.script($new.options as number).then(async (script) => {
						const files = [];

						for (let index = 0; index < script.files.length; index++) {
							if (worker.get()[script.id] && worker.get()[script.id].files[index].written === worker.get()[script.id].files[index].size) {
								if (await window.API(API_COMMAND.IS_PACKAGED).then((packaged) => { return packaged; })) {
									files.push(`${await window.API(API_COMMAND.GET_PATH).then((path) => { return path; })}/${worker.get()[script.id]?.files[index].path}`);
								} else {
									files.push(`../${worker.get()[script.id]?.files[index].path}`);
								}
							} else {
								files.push(script.files[index].url);
							}
						}
						this.setState({ ...this.state, script: script, media: { ...this.state.media, options: { ...this.state.media.options, files: files } } });
					});
					break;
				}
				default: {
					break;
				}
			}
		});
	}
	static getDerivedStateFromProps($new: ViewerProps, $old: ViewerProps) {
		return $new;
	}
	public render() {
		if (this.props.enable) {
			// discord rich presence
			DiscordRPC.set_activity({ ...(this.state.script ? { details: this.state.script.title + "#" + this.state.script.id, state: "Reading", partySize: undefined, partyMax: undefined } : { details: undefined, state: "Fetching", partySize: undefined, partyMax: undefined }) });
		}
		return (
			<section data-viewport="viewer" class={utility.inline({ "enable": this.props.enable, "right": true })}>
				<MediaPlayer options={{ files: this.state.media.options.files }}></MediaPlayer>
			</section>
		);
	}
}
export default Viewer;
