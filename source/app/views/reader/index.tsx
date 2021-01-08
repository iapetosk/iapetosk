import * as React from "react";

import "./index.scss";

import Media from "@/app/components/media";

import DiscordRPC from "@/modules/discordRPC";

import utility from "@/modules/utility";
import worker from "@/statics/worker";
import read, { GalleryJS } from "@/modules/hitomi/read";

import { StaticEvent } from "@/statics";
import { MediaProps } from "@/app/components/media";
import { Viewport } from "@/statics/router";

export type ReaderProps = {
	enable: boolean;
};
export type ReaderState = {
	script?: GalleryJS,
	media: MediaProps;
};

class Reader extends React.Component<ReaderProps> {
	public props: ReaderProps;
	public state: ReaderState;
	constructor(props: ReaderProps) {
		super(props);
		this.props = props;
		this.state = { script: undefined, media: { files: [] } };

		window.static.on(StaticEvent.ROUTER, (args) => {
			const [$new, $old] = args as [Viewport, Viewport];

			switch ($new.view) {
				case "reader": {
					this.setState({ ...this.state, script: undefined, media: { ...this.state.media, files: [] } });
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
						this.setState({ ...this.state, script: script, media: { ...this.state.media, files: files } });
					});
					break;
				}
				default: {
					break;
				}
			}
		});
	}
	static getDerivedStateFromProps($new: ReaderProps, $old: ReaderProps) {
		return $new;
	}
	public render() {
		if (this.props.enable) {
			// RPC
			DiscordRPC.set_activity({
				...(this.state.script ? {
					details: this.state.script.title + "#" + this.state.script.id,
					state: "Reading",
					partySize: undefined,
					partyMax: undefined
				} : {
					details: undefined,
					state: "Fetching",
					partySize: undefined,
					partyMax: undefined
				})
			});
		}
		return (
			<section id="reader" class={utility.inline({ "enable": this.props.enable, "right": true })}>
				<Media files={this.state.media.files}></Media>
			</section>
		);
	}
}
export default Reader;
