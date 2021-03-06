import * as React from "react";

import "./index.scss";

import TitleBar from "@/app/components/titlebar";
import Overlay from "@/app/views/overlay";
import Browser from "@/app/views/browser";
import Viewer from "@/app/views/viewer";

import router from "@/statics/router";

import { BridgeEvent } from "@/common";
import { StaticEvent } from "@/statics";
import { Viewport } from "@/statics/router";

export type AppProps = {};
export type AppState = {
	view: Viewport["view"],
	terminal: boolean,
	fullscreen: boolean;
};

class App extends React.Component<AppProps, AppState> {
	public props: AppProps;
	public state: AppState;
	constructor(props: AppProps) {
		super(props);
		this.props = props;
		this.state = { view: router.get().view, terminal: false, fullscreen: false };

		window.static.on(StaticEvent.ROUTER, (args) => {
			const [$new, $old] = args as [Viewport, Viewport];

			this.setState({ ...this.state, view: $new.view });
		});
		window.bridge.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
		window.bridge.on(BridgeEvent.TOGGLE_TERMINAL, () => {
			this.setState({ ...this.state, terminal: !this.state.terminal });
		});
	}
	public render() {
		return (
			<>
				<TitleBar enable={!this.state.fullscreen}></TitleBar>
				<section id="content" class="contrast">
					<Browser enable={this.state.view === "browser"}></Browser>
					<Viewer enable={this.state.view === "viewer"}></Viewer>
					<Overlay enable={this.state.terminal}></Overlay>
				</section>
			</>
		);
	}
}
export default App;
