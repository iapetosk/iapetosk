import * as React from "react";

import "./index.scss";

import ScrollBar from "@/renderer/components/scrollbar";
export type ReaderState = {};

class Reader extends React.Component<ReaderState> {
	public state: ReaderState;
	constructor(properties: ReaderState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<section id="reader" class="contrast">
				<ScrollBar router="reader"></ScrollBar>
			</section>
		);
	}
}
export default Reader;
