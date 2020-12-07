import * as React from "react";

import "./index.scss";

import read from "@/modules/hitomi/read";
import listener from "@/modules/listener";
import router from "@/scheme/router";

import { Scheme } from "@/scheme";
import { Layer } from "@/scheme/router";
import { GalleryJS } from "@/modules/hitomi/read";

import LazyLoad from "@/renderer/components/lazyload";

export type MediaState = {
	script?: GalleryJS;
};

class Media extends React.Component<MediaState> {
	public state: MediaState;
	constructor(properties: MediaState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.ROUTER, ($new: Layer) => {
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
				<section id="scrollable">
					{this.state.script?.files.map((file, index) => {
						return (
							<LazyLoad src={file.url} width={file.width} height={file.height} key={index}></LazyLoad>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Media;
