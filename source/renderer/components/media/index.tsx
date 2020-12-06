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
							<img src={"data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="} width={file.width} height={file.height} loading="lazy" key={index}
								onLoad={(event) => {
									// @ts-ignore HTMLImageElement
									switch (event.target.src) {
										case file.url: {
											break;
										}
										default: {
											const observer = new IntersectionObserver((entries) => {
												for (const entry of entries) {
													// target is within view
													if (entry.isIntersecting) {
														// @ts-ignore
														event.target.src = file.url;
														// stop observe
														observer.disconnect();
													}
												}
											});
											observer.observe(event.target as Element);
											break;
										}
									}
								}}
								onError={(event) => {
									// @ts-ignore
									event.target.style.display = "none";
								}}
							></img>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Media;
