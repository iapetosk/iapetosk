import * as React from "react";

import "./index.scss";

import read from "@/modules/hitomi/read";
import listener from "@/modules/listener";
import router from "@/statics/router";

import { Static } from "@/statics";
import { Viewport } from "@/statics/router";
import { GalleryJS } from "@/modules/hitomi/read";

import LazyLoad from "@/app/components/lazyload";

export type MediaProps = {};
export type MediaState = {
	script?: GalleryJS;
};

class Media extends React.Component<MediaProps, MediaState> {
	public props: MediaProps;
	public state: MediaState;
	constructor(props: MediaProps) {
		super(props);
		this.props = props;
		this.state = { script: undefined };

		listener.on(Static.ROUTER, ($new: Viewport) => {
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
				<section id="scrollable" class="scroll-y">
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
