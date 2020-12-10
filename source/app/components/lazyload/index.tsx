import * as React from "react";

import "./index.scss";

export type LazyLoadState = {
	src: string,
	width?: number,
	height?: number;
};

const base64 = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class LazyLoad extends React.Component<LazyLoadState> {
	public state: LazyLoadState;
	public error = 0;
	constructor(properties: LazyLoadState) {
		super(properties);
		this.state = { ...properties };
	}
	public render() {
		return (
			<img src={base64} alt="" width={this.state.width} height={this.state.height} loading="lazy"
				onLoad={(event) => {
					// @ts-ignore
					if (event.target.src === this.state.src) {
						// reset
						this.error = 0;
					}
					else if (this.error < 5) {
						const observer = new IntersectionObserver((entries) => {
							for (const entry of entries) {
								// target is within view
								if (entry.isIntersecting) {
									// @ts-ignore
									event.target.src = this.state.src;
									// stop observe
									observer.disconnect();
								}
							}
						});
						observer.observe(event.target as Element);
					}
				}}
				onError={(event) => {
					// increase
					this.error++;
					// @ts-ignore
					event.target.src = base64;
				}}
			></img>
		);
	}
}
export default LazyLoad;
