import * as React from "react";

import "./treeview.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import request from "@/modules/request";
import worker from "@/scheme/worker";
import { Thread } from "@/modules/download";

export type TreeViewState = {
	[key: string]: {
		favicon: string,
		count: number;
	};
};

class TreeView extends React.Component<TreeViewState, any> {
	public state: TreeViewState;
	constructor(properties: TreeViewState) {
		super(properties);
		this.state = { ...properties };

		listener.on("worker.threads", ($new: Thread[]) => {
			this.update();
		});
	}
	public componentDidMount(): void {
		this.update();
	}
	public async update() {
		const treeview: TreeViewState = {};

		for (const thread of worker.index("threads").get()) {
			const host: string = request.parse(thread.from).host;

			if (treeview[host]) {
				treeview[host] = {
					...treeview[host],
					count: treeview[host].count + 1
				};
			} else if (this.state[host]) {
				treeview[host] = {
					...this.state[host],
					count: 1
				};
			} else {
				treeview[host] = {
					favicon: await request.get(`https://${host}`).then((callback) => {
						const icon = {
							// https://en.wikipedia.org/wiki/Favicon
							default: utility.parse(callback.content.encode, "link[rel=\"icon\"]", "href"),
							shortcut: utility.parse(callback.content.encode, "link[rel=\"shortcut icon\"]", "href")
						};
						return this.favicon(host, icon.default.length ? icon.default : icon.shortcut);
					}),
					count: 1
				};
			}
		}
		this.setState({ ...treeview });
	}
	private favicon(hostname: string, path: string | string[]): string {
		path = path instanceof Array ? path[0] : path;
		// for unknown reason, sometimes path is undefined
		if (path) {
			path = path.startsWith("//") ? path : [hostname, path].join("/");
			path = path.startsWith("http") || path.startsWith("https") ? path : `https://${path}`;
		}
		return path;
	}
	public render(): JSX.Element {
		return (
			<main id="treeview" className="contrast">
				{Object.keys(this.state).map((value, index) => {
					return (
						<section id="wrapper" className="contrast" key={index}>
							<canvas id="favicon" className="contrast" style={{ backgroundImage: `url(${this.state[value].favicon})` }}></canvas>
							<legend id="hostname">{value} [{this.state[value].count}]</legend>
						</section>
					);
				})}
			</main>
		);
	}
}
export default TreeView;
