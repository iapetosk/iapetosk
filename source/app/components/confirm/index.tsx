import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

export type ConfirmProps = {
	enable: boolean;
	// Preference | Confirm | Terminal
};
export type ConfirmState = {};

class Confirm extends React.Component<ConfirmProps> {
	public props: ConfirmProps;
	public state: ConfirmState;
	constructor(props: ConfirmProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	static getDerivedStateFromProps($new: ConfirmProps, $old: ConfirmProps) {
		return $new;
	}
	public render() {
		return (
			<section data-viewport="overlay" class={utility.inline({ "enable": this.props.enable })}>
				<section id="overlay">

				</section>
			</section>
		);
	}
}
export default Confirm;
