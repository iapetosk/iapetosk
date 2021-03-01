import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";
import Terminal from "@/app/components/terminal";

export type OverlayProps = {
	enable: boolean;
	// Preference | Confirm | Terminal
};
export type OverlayState = {};

class Overlay extends React.Component<OverlayProps> {
	public props: OverlayProps;
	public state: OverlayState;
	constructor(props: OverlayProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	static getDerivedStateFromProps($new: OverlayProps, $old: OverlayProps) {
		return $new;
	}
	public render() {
		return (
			<section data-viewport="overlay" class={utility.inline({ "enable": this.props.enable, "center": true })}>
				<section id="overlay" class="contrast center">
					<Terminal options={{}}></Terminal>
				</section>
			</section>
		);
	}
}
export default Overlay;
