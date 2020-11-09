import * as React from "react";

import "./index.scss";

import ScrollBar from "@/renderer/components/scrollbar";

export type BrowserState = {};

class Browser extends React.Component<BrowserState> {
	public state: BrowserState;
	constructor(properties: BrowserState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<section id="browser" class="contrast">
				<ScrollBar router="browser"></ScrollBar>
			</section>
		);
	}
}
export default Browser;
