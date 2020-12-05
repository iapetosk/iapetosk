import * as React from "react";

import "./index.scss";

import read from "@/modules/hitomi/read";

import listener from "@/modules/listener";
import router from "@/scheme/router";

import { Scheme } from "@/scheme";
import { Layer } from "@/scheme/router";
import { GalleryJS } from "@/modules/hitomi/read";

export type MediaState = {
	script?: GalleryJS;
};

class Media extends React.Component<MediaState> {
	public state: MediaState;
	constructor(properties: MediaState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.ROUTER, ($new: Layer) => {
			/*
			setTimeout(() => {
				this.setState({ ...this.state, script: undefined });
			}, $new.view === "reader" ? 0 : 500);
			*/
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
	}
	public render() {
		return (
			<section id="media">
				<section id="navigation" class="contrast center-x">
					{[
						{
							HTML: require(`!html-loader!@/assets/icons/return.svg`),
							click: () => {
								router.set({ view: "browser", options: undefined });
							}
						}
					].map((value, index) => {
						return (
							<button key={index}
								onClick={() => {
									value.click();
								}}
								dangerouslySetInnerHTML={{ __html: value.HTML }}>
							</button>
						);
					})}
				</section>
				<section id="scrollable">
					{this.state.script?.files.map((value, index) => {
						return (
							<img src={value.url} key={index}
								onError={(event) => {
									(event.target as HTMLElement).style.display = "none";
								}}>
							</img>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Media;
