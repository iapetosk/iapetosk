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
		active: boolean,
		count: number;
	};
};

class TreeView extends React.Component<TreeViewState, any> {
	public state: TreeViewState;
	constructor(properties: TreeViewState) {
		super(properties);
		this.state = { ...properties };

		listener.on("worker_threads", ($new: Thread[]) => {
			this.update($new);
		});
	}
	public componentDidMount(): void {
		this.update(worker.get("threads"));
	}
	public async update(worker: Thread[]) {
		const genesis: TreeViewState = {};

		for (const thread of worker) {
			const hostname = thread.from.replace(/https?:\/\/(www.)?/, "").split(/\//)[0];

			if (genesis[hostname]) {
				genesis[hostname] = {
					...genesis[hostname],
					count: genesis[hostname].count + 1
				};
			} else if (this.state[hostname]) {
				genesis[hostname] = {
					...this.state[hostname],
					count: 1
				};
			} else {
				genesis[hostname] = {
					favicon: await request.get(`https://${hostname}`).then((callback) => {
						const icon = {
							// https://en.wikipedia.org/wiki/Favicon
							default: utility.parse(callback.content.encode, "link[rel=\"icon\"]", "href"),
							shortcut: utility.parse(callback.content.encode, "link[rel=\"shortcut icon\"]", "href")
						};
						return this.favicon(hostname, icon.default.length ? icon.default : icon.shortcut);
					}),
					active: false,
					count: 1
				};
			}
		}
		this.setState(genesis);
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
