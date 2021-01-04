import { ipcRenderer } from "electron";

import * as React from "react";

import "./index.scss";

import TitleBar from "@/app/components/titlebar";
import Browser from "@/app/views/browser";
import Reader from "@/app/views/reader";

import listener from "@/modules/listener";
import router from "@/statics/router";

import { StaticEvent } from "@/statics";
import { Viewport } from "@/statics/router";
import { ipcEvent } from "@/modules/listener";

export type AppProps = {};
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

		listener.on(StaticEvent.ROUTER, ($new: Viewport) => {
			this.setState({ ...this.state, view: $new.view });
		});
		ipcRenderer.on(ipcEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		ipcRenderer.on(ipcEvent.LEAVE_FULL_SCREEN, () => {
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
