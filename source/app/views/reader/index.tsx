import * as React from "react";

import "./index.scss";

import Media from "@/app/components/media";

import utility from "@/modules/utility";

export type ReaderProps = {
	enable: boolean;
};
export type ReaderState = {};

class Reader extends React.Component<ReaderProps> {
	public props: ReaderProps;
	public state: ReaderState;
	constructor(props: ReaderProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	static getDerivedStateFromProps($new: ReaderProps, $old: ReaderProps) {
		return $new;
	}
	public render() {
		return (
			<section id="reader" class={utility.inline({ "enable": this.props.enable, "right": true })}>
				<Media></Media>
			</section>
		);
	}
}
export default Reader;
