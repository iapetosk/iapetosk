import * as React from "react";

import "./index.scss";

import settings from "@/modules/settings";
import utility from "@/modules/utility";

import { CommonProps } from "@/common";
import { Config } from "@/modules/settings";

export type LazyLoadProps = CommonProps & {
	options: {
		source: string;
	},
	handler?: Record<"loaded", () => void>;
};
export type LazyLoadState = {
	error: number;
};

const base64 = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class LazyLoad extends React.Component<LazyLoadProps, LazyLoadState> {
	readonly config: Config["lazyload"] = settings.get().lazyload;
	public props: LazyLoadProps;
	public state: LazyLoadState;
	constructor(props: LazyLoadProps) {
		super(props);
		this.props = props;
		this.state = {
			error: 0
		};
	}
	public render() {
		return (
			<img data-component="lazyload" id={this.props.id} src={base64} class={utility.inline({ "error": this.state.error === this.config.retry, ...this.props.class })} loading="lazy"
				onLoad={(event) => {
					if ((event.target as HTMLImageElement).src === this.props.options.source) {
						this.setState({ ...this.state, error: 0 }, () => {
							this.props.handler?.loaded();
						});
					}
					else if (this.state.error < this.config.retry) {
						const observer: IntersectionObserver = new IntersectionObserver((entries) => {
							for (const entry of entries) {
								if (entry.isIntersecting) {
									(event.target as HTMLImageElement).src = this.props.options.source;
									return observer.disconnect();
								}
							}
						});
						observer.observe(event.target as HTMLImageElement);
					}
				}}
				onError={(event) => {
					this.setState({ ...this.state, error: this.state.error + 1 }, () => {
						(event.target as HTMLImageElement).src = base64;
					});
				}}
			></img>
		);
	}
}
export default LazyLoad;
