import * as React from "react";

import "@/renderer/components/styles/iterable.scss";

import * as path from "path";
import * as process from "child_process";

import listener from "@/modules/listener";
import download from "@/modules/download";
import utility from "@/modules/utility";
import worker from "@/scheme/worker";
import scroll from "@/scheme/scroll";

import { Scheme } from "@/scheme";
import { Status, Thread } from "@/modules/download";

export type IterableState = {};

class Iterable extends React.Component<IterableState> {
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		scroll.set({ length: 15, index: 0, size: worker.get().length });

		listener.on(Scheme.WORKER, ($new: Thread[]) => {
			scroll.set({ ...scroll.get(), size: $new.length });
		});
		listener.on(Scheme.SCROLL, () => {
			const
				target: HTMLElement = document.getElementById("scrollable")!,
				height: number = utility.truncate(target.scrollHeight / worker.get().length, 1),
				begin: number = target.scrollTop / height,
				end: number = (target.scrollTop + target.clientHeight) / height;

			target.scroll(0, height * (scroll.get().index - Math.floor((end - begin) / 2)));

			this.setState({ ...this.state });
		});
	}
	public render(): JSX.Element {
		return (
			<main id="iterable">
				<section id="scrollable"
					onWheel={(event) => {
						if (event.deltaY > 0 && scroll.get().index < worker.get().length - 1) {
							scroll.set({ ...scroll.get(), index: scroll.get().index + 1 });
						} if (event.deltaY < 0 && scroll.get().index > 0) {
							scroll.set({ ...scroll.get(), index: scroll.get().index - 1 });
						}
					}}>
					{worker.get().map((value, index) => {
						return (
							<section id="process" className={utility.inline({ contrast: true, highlight: scroll.get().index === index, [Status[value.status].toLowerCase()]: true })} draggable={true} key={index}
								onClick={() => {
									scroll.set({ ...scroll.get(), index: index });
								}}>
								<legend id="title" className="contrast flowless">#{index} {value.title} - ({value.finished} / {value.files.length})</legend>
								<figure id="wrapper" className="contrast">
									<canvas id="thumbnail" className="contrast" style={{ backgroundImage: value.files[0].written === value.files[0].size ? `url(${value.files[0].path.replace(/\\/g, `/`)})` : undefined }}>
									</canvas>
									<button id="delete"
										onClick={() => {
											return download.remove(value.id);
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
											return process.exec(`start "" "${path.dirname(value.files[0].path)}"`);
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
