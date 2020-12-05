import * as React from "react";

import "./index.scss";

import TitleBar from "@/renderer/components/titlebar";
import Paging from "@/renderer/components/paging";

import Browser from "@/renderer/views/browser";
import Reader from "@/renderer/views/reader";

import listener from "@/modules/listener";
import utility from "@/modules/utility";

import { Scheme } from "@/scheme";
import { Layer } from "@/scheme/router";

export type AppState = {
	view: string,
	focus: boolean,
	restore: boolean,
	fullscreen: boolean;
};

class App extends React.Component<AppState> {
	public state: AppState;
	constructor(properties: AppState) {
		super(properties);
		this.state = { ...properties };

		utility.referer("https://hitomi.la");

		nw.App.registerGlobalHotKey(new nw.Shortcut(
			{ key: "F11", active: () => { if (this.state.focus) { nw.Window.get().toggleFullscreen(); } } },
			// @ts-ignore
			{ key: "ESCAPE", active: () => { if (this.state.fullscreen) { nw.Window.get().leaveFullscreen(); } } }
		));
		switch (process.env.NODE_ENV) {
			case "development": {
				nw.Window.get().showDevTools();
				break;
			}
		}
		listener.on("reload", () => {
			window.location.reload();
		});
		listener.on(Scheme.ROUTER, ($new: Layer) => {
			this.setState({ ...this.state, view: $new.view });
		});
		nw.Window.get().on("focus", () => {
			this.setState({ ...this.state, focus: true });
		});
		nw.Window.get().on("blur", () => {
			this.setState({ ...this.state, focus: false });
		});
		nw.Window.get().on("maximize", () => {
			this.setState({ ...this.state, restore: true });
		});
		nw.Window.get().on("restore", () => {
			this.setState({ ...this.state, restore: false, fullscreen: false });
		});
		nw.Window.get().on("enter-fullscreen", () => {
			this.setState({ ...this.state, fullscreen: true });
		});
	}
	public render() {
		return (
			<>
				<TitleBar visible={!this.state.fullscreen} focus={this.state.focus} restore={this.state.restore} fullscreen={this.state.fullscreen}></TitleBar>
				<section id="content" class="contrast">
					<Browser disable={this.state.view !== "browser"}></Browser>
					<Reader disable={this.state.view !== "reader"}></Reader>
				</section>
				<Paging visible={!this.state.fullscreen && this.state.view !== "reader"} disable={false}></Paging>
			</>
		);
	}
}
export default App;
