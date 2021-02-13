import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type LazyLoadProps = CommonProps & {
	src: string,
	width?: number,
	height?: number;
};
export type LazyLoadState = {
	error: number;
};

const base64 = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class LazyLoad extends React.Component<LazyLoadProps, LazyLoadState> {
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
			<img id="lazyload" src={base64} class={utility.inline({ ...this.props.class, "error": this.state.error === 5 })} width={this.props.width} height={this.props.height} loading="lazy"
				onLoad={(event) => {
					if ((event.target as HTMLImageElement).src === this.props.src) {
						this.setState({ ...this.state, error: 0 });
					}
					else if (this.state.error < 5) {
						const observer: IntersectionObserver = new IntersectionObserver((entries) => {
							for (const entry of entries) {
								if (entry.isIntersecting) {
									(event.target as HTMLImageElement).src = this.props.src;
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
