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
		list: number[];
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

		this.update(worker.get("threads"));
	}
	public async update(worker: Thread[]) {
		const genesis: TreeViewState = {};

		for (const thread of worker) {
			const hostname = thread.from.replace(/https?:\/\/(www.)?/, "").split(/\//)[0];

			if (genesis[hostname]) {
				genesis[hostname] = {
					...genesis[hostname],
					list: [...genesis[hostname].list, thread.id]
				};
			} else if (this.state[hostname]) {
				genesis[hostname] = {
					...this.state[hostname],
					list: [thread.id]
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
					list: [thread.id]
				};
			}
		}

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
				{Object.values(this.state).map((value, index) => {
					return (
						<section id="wrapper" className="contrast">
							<figure id="instance" className="contrast">
								<canvas id="favicon" className="contrast" style={{ backgroundColor: `url(${value.favicon})` }}></canvas>
								<legend id="hostname">{{ index }}</legend>
							</figure>
							{value.list.map((value, index) => {
								return (
									<figure id="collapse">
										<button className="contrast">{{ value }}</button>
									</figure>
								);
							})}
						</section>
					);
				})}
			</main>
		);
	}
}
export default TreeView;