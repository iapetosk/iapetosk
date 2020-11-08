import * as React from "react";
// style
import "./index.scss";
// components
import TitleBar from "@/renderer/components/titlebar";
import TaskBar from "@/renderer/components/taskbar";
// views
import Browser from "@/renderer/views/browser";
import Reader from "@/renderer/views/reader";
// modules
import listener from "@/modules/listener";
import router from "@/scheme/router";

export type AppState = {};

class App extends React.Component<AppState> {
	public state: AppState;
	constructor(properties: AppState) {
		super(properties);
		this.state = { ...properties };

		if (process.env.NODE_ENV === "development") {
			nw.Window.get().showDevTools();
		}
		listener.on("reload", () => {
			window.location.reload();
		});
	}
	public render(): JSX.Element {
		return (
			<main id="container">
				<TitleBar focus={false} restore={false} fullscreen={false}></TitleBar>
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
				<TaskBar></TaskBar>
			</main>
		);
	}
}
export default App;
