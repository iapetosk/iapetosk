import * as React from "react";

import "@/renderer/components/styles/treeview.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import request from "@/modules/request";
import worker from "@/scheme/worker";

import { Scheme } from "@/scheme";
import { Thread } from "@/modules/download";

export type TreeViewState = {
	[key: string]: {
		favicon: string,
		count: number;
	};
};

class TreeView extends React.Component<TreeViewState> {
	public state: TreeViewState;
	constructor(properties: TreeViewState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.WORKER, ($new: Thread[]) => {
			this.update();
		});
	}
	public async update() {
		const state: TreeViewState = {};

		for (const thread of worker.get()) {
			const host: string = request.parse(thread.from).host;

			if (state[host]) {
				state[host] = {
					...state[host],
					count: state[host].count + 1
				};
			} else if (this.state[host]) {
				state[host] = {
					...this.state[host],
					count: 1
				};
			} else {
				state[host] = {
					favicon: await request.get(`https://${host}`).then((callback) => {
						const icon: {
							default: string | string[],
							shortcut: string | string[];
						} = {
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
		this.setState({ ...state });
	}
	private favicon(hostname: string, path: string | string[]): string {
		path = path instanceof Array ? path[0] : path;
		// for unknown reason, sometimes path is undefined
		if (path) {
			path = /^\/\/?/.test(path) ? path : [hostname, path].join("/");
			path = /^https?/.test(path) ? path : `https://${path}`;
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
