import * as React from "react";

import "./app.scss";

import ScrollBar from "@/renderer/components/scrollbar";
import TitleBar from "@/renderer/components/titlebar";
import QueryBox from "@/renderer/components/querybox";
import TreeView from "@/renderer/components/treeview";
import Iterable from "@/renderer/components/iterable";
import TaskBar from "@/renderer/components/taskbar";

import Listener from "@/modules/listener";

export type AppState = {};

class App extends React.Component<AppState, any> {
	public state: AppState;
	constructor(properties: AppState) {
		super(properties);
		this.state = { ...properties };

		if (process.env.NODE_ENV === "development") {
			nw.Window.get().showDevTools();
		}
		Listener.on("reload", () => {
			window.location.reload();
		});
	}

	public render(): JSX.Element {
		return (
			<main id="container">
				<TitleBar focus={false} restore={false} fullscreen={false}></TitleBar>
				<article id="content">
					<QueryBox></QueryBox>
					<TreeView></TreeView>
					<Iterable></Iterable>
					<ScrollBar></ScrollBar>
				</article>
				<TaskBar></TaskBar>
			</main>
		);
	}
}
export default App;
