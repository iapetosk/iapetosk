import * as React from "react";

import "./index.scss";

export type LazyLoadProps = {
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
		this.state = { error: 0 };
	}
	public render() {
		return (
			<img src={base64} width={this.props.width} height={this.props.height} loading="lazy"
				onLoad={(event) => {
					// @ts-ignore
					if (event.target.src === this.props.src) {
						// reset
						this.setState({ ...this.state, error: 0 });
					}
					else if (this.state.error < 5) {
						const observer = new IntersectionObserver((entries) => {
							for (const entry of entries) {
								// target is within view
								if (entry.isIntersecting) {
									// @ts-ignore
									event.target.src = this.props.src;
									// stop observe
									observer.disconnect();
								}
							}
						});
						observer.observe(event.target as Element);
					}
					else {
						// @ts-ignore
						event.target.style.display = "none";
					}
				}}
				onError={(event) => {
					// increase
					this.setState({ ...this.state, error: this.state.error + 1 }, () => {
						// @ts-ignore
						event.target.src = base64;
					});
				}}
			></img>
		);
	}
}
export default LazyLoad;
