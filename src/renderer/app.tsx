import * as React from "react";

import "@/renderer/app.scss";

import ScrollBar from "@/renderer/components/xamls/scrollbar";
import TitleBar from "@/renderer/components/xamls/titlebar";
import QueryBox from "@/renderer/components/xamls/querybox";
import TreeView from "@/renderer/components/xamls/treeview";
import Iterable from "@/renderer/components/xamls/iterable";
import TaskBar from "@/renderer/components/xamls/taskbar";

import Listener from "@/modules/listener";

export type AppState = {};

class App extends React.Component<AppState> {
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
