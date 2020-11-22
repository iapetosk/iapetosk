import * as React from "react";

import "./index.scss";

import TitleBar from "@/renderer/components/titlebar";
import Paging from "@/renderer/components/paging";

import Browser from "@/renderer/views/browser";
import Reader from "@/renderer/views/reader";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import router from "@/scheme/router";

export type AppState = {
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
		if (process.env.NODE_ENV = "production") {
			nw.Window.get().showDevTools();	
		}
		listener.on("reload", () => {
			window.location.reload();
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
	public render(): JSX.Element {
		return (
			<main id="container">
				{(() => {
					switch (this.state.fullscreen) {
						case true: {
							return undefined;
						}
						default: {
							return <TitleBar focus={this.state.focus} restore={this.state.restore} fullscreen={this.state.fullscreen}></TitleBar>;
						}
					}
				})()}
				<code id="content">
					{(() => {
						switch (router.index()) {
							case "browser": {
								return (<Browser></Browser>);
							}
							case "reader": {
								return (<Reader></Reader>);
							}
							default: {
								return undefined;
							}
						}
					})()}
				</code>
				{(() => {
					switch (this.state.fullscreen) {
						case true: {
							return undefined;
						}
						default: {
							return <Paging></Paging>;
						}
					}
				})()}
			</main>
		);
	}
}
export default App;
