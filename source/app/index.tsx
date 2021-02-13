import * as React from "react";

import "./index.scss";

import TitleBar from "@/app/components/titlebar";
import Browser from "@/app/views/browser";
import Reader from "@/app/views/reader";

import router from "@/statics/router";

import { BridgeEvent, CommonProps } from "@/common";
import { StaticEvent } from "@/statics";
import { Viewport } from "@/statics/router";

export type AppProps = CommonProps & {};
export type AppState = {
	view: string,
	fullscreen: boolean;
};

class App extends React.Component<AppProps, AppState> {
	public props: AppProps;
	public state: AppState;
	constructor(props: AppProps) {
		super(props);
		this.props = props;
		this.state = { view: router.get().view, fullscreen: false };

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
	}
	public render() {
		return (
			<>
				<TitleBar enable={!this.state.fullscreen}></TitleBar>
				<section id="content" class="contrast">
					<Browser enable={this.state.view === "browser"}></Browser>
					<Reader enable={this.state.view === "reader"}></Reader>
				</section>
			</>
		);
	}
}
export default App;
