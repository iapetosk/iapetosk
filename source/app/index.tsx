import * as React from "react";
import { remote } from "electron";

import "./index.scss";

import TitleBar from "@/app/components/titlebar";
import Browser from "@/app/views/browser";
import Reader from "@/app/views/reader";

import listener from "@/modules/listener";

import { Scheme } from "@/scheme";
import { Layer } from "@/scheme/router";

export type AppState = {
	view: string,
	focus: boolean,
	maximize: boolean,
	fullscreen: boolean;
};

const $window = remote.getCurrentWindow();

class App extends React.Component<AppState> {
	public state: AppState;
	constructor(properties: AppState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.ROUTER, ($new: Layer) => {
			this.setState({ ...this.state, view: $new.view });
		});
		$window.on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		$window.on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		$window.on("maximize", () => {
			this.setState({ ...this.state, maximize: true });
		});
		$window.on("unmaximize", () => {
			this.setState({ ...this.state, maximize: false });
		});
		$window.on("enter-full-screen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		$window.on("leave-full-screen", () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	public render() {
		return (
			<>
				<TitleBar disable={this.state.fullscreen} focus={this.state.focus} maximize={this.state.maximize} fullscreen={this.state.fullscreen}></TitleBar>
				<section id="content" class="contrast">
					<Browser disable={this.state.view !== "browser"}></Browser>
					<Reader disable={this.state.view !== "reader"}></Reader>
				</section>
			</>
		);
	}
}
export default App;
