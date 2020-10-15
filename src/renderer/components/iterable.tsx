import * as React from "react";

import "./iterable.scss";

import * as Path from "path";
import * as Process from "child_process";

import Listener from "@/modules/listener";
import Download from "@/modules/download";
import Utility from "@/modules/utility";
import Worker from "@/scheme/worker";
import Scroll from "@/scheme/scroll";

import { Scheme } from "@/scheme";
import { Status, Thread } from "@/modules/download";

export type IterableState = {};

class Iterable extends React.Component<IterableState, any> {
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		Scroll.set({ length: 15, index: 0, size: Worker.get().length });

		Listener.on(Scheme.WORKER, ($new: Thread[]) => {
			Scroll.set({ ...Scroll.get(), size: $new.length });
		});
		Listener.on(Scheme.SCROLL, () => {
			const
				target: HTMLElement = document.getElementById("scrollable")!,
				height: number = Utility.truncate(target.scrollHeight / Worker.get().length),
				begin: number = target.scrollTop / height,
				end: number = (target.scrollTop + target.clientHeight) / height;

			target.scroll(0, height * (Scroll.get().index - Math.floor((begin - end) / 2)));

			this.setState({ ...this.state });
		});
	}
	public render(): JSX.Element {
		return (
			<main id="iterable">
				<section id="scrollable"
					onWheel={(event) => {
						if (event.deltaY > 0 && Scroll.get().index < Worker.get().length - 1) {
							Scroll.set({ ...Scroll.get(), index: Scroll.get().index + 1 });
						} if (event.deltaY < 0 && Scroll.get().index > 0) {
							Scroll.set({ ...Scroll.get(), index: Scroll.get().index - 1 });
						}
					}}>
					{Worker.get().map((value, index) => {
						return (
							<section id="process" className={Utility.inline({ contrast: true, highlight: Scroll.get().index === index, [Status[value.status].toLowerCase()]: true })} draggable={true} key={index}
								onClick={() => {
									Scroll.set({ ...Scroll.get(), index: index });
								}}>
								<legend id="title" className="contrast flowless">{value.title} - ({value.finished} / {value.files.length})</legend>
								<figure id="wrapper" className="contrast">
									<canvas id="thumbnail" className="contrast" style={{ backgroundImage: value.files[0].written === value.files[0].size ? `url(${value.files[0].path.replace(/\\/g, `/`)})` : undefined }}>
									</canvas>
									<button id="delete"
										onClick={() => {
											return Download.remove(value.id);
										}}
										dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/delete.svg`) }}
									>
									</button>
									<button id="copy"
										onClick={() => {
											return navigator.clipboard.writeText(value.from);
										}}
										dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/copy.svg`) }}
									>
									</button>
									<button id="open"
										onClick={() => {
											return Process.exec(`start "" "${Path.dirname(value.files[0].path)}"`);
										}}
										dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/open.svg`) }}
									>
									</button>
									<button id="read"
										onClick={() => {
											// TODO: READ
										}}
										dangerouslySetInnerHTML={{ __html: require(`!html-loader!@/assets/icons/read.svg`) }}
									>
									</button>
								</figure>
							</section>
						);
					})}
				</section>
			</main>
		);
	}
}
export default Iterable;
