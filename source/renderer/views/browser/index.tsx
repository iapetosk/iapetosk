import * as React from "react";

import "./index.scss";

import Query from "@/renderer/components/query";
import Iterable from "@/renderer/components/iterable";

export type BrowserState = {};

class Browser extends React.Component<BrowserState> {
	public state: BrowserState;
	constructor(properties: BrowserState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<section id="browser">
				<Query></Query>
				<Iterable></Iterable>
			</section>
		);
	}
}
export default Browser;
