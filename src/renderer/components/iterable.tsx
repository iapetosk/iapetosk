import * as React from "react";

import "./iterable.scss";

import * as path from "path";
import * as process from "child_process";
import listener from "@/modules/listener";
import utility from "@/modules/utility";
import worker from "@/scheme/worker";
import download, { Status, Thread } from "@/modules/download";

export type IterableState = {
	scroll_length: number,
	scroll_index: number;
};

class Iterable extends React.Component<IterableState, any> {
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		listener.on("worker.threads", ($new: Thread[]) => {
			this.setState({ ...this.state, scroll_index: utility.clamp(this.state.scroll_index, 0, $new.length - 1) });
		});
	}
	public componentDidUpdate(): void {
		const target: HTMLElement = document.getElementById("scroll_area")!;

		const height: number = utility.truncate(target.scrollHeight / worker.index("threads").get().length);

		let start: number = (target.scrollTop) / height;
		let finish: number = (target.scrollTop + target.clientHeight) / height;
		let ranging: number = finish - start;

		target.scroll(0, height * (this.state.scroll_index - Math.floor(ranging / 2)));
	}
	public render(): JSX.Element {
		return (
			<main id="iterable"
				onWheel={(event) => {
					if (event.deltaY > 0 && this.state.scroll_index < worker.index("threads").get().length - 1) {
						this.setState({ ...this.state, scroll_index: this.state.scroll_index + 1 });
					} if (event.deltaY < 0 && this.state.scroll_index > 0) {
						this.setState({ ...this.state, scroll_index: this.state.scroll_index - 1 });
					}
				}}>
				<section id="scroll_area">
					{worker.index("threads").get().map((value, index) => {
						return (
							<section id="process" className={utility.inline({ contrast: true, highlight: this.state.scroll_index === index, [Status[value.status].toLowerCase()]: true })} key={index}
								onClick={() => {
									this.setState({ ...this.state, scroll_index: index });
								}}>
								<legend id="title" className="contrast flowless">{value.title} - ({value.finished} / {value.files.length})</legend>
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
				<section id="scroll_track" className="contrast">
					{[...new Array(this.state.scroll_length)].map((value, index) => {
						return (
							<button id="scroll_metre" className={utility.inline({ highlight: worker.index("threads").get().length < this.state.scroll_length ? (this.state.scroll_index) * (1.0 / worker.index("threads").get().length) < (index + 1.0) / this.state.scroll_length && (index + 1.0) / this.state.scroll_length <= (this.state.scroll_index + 1.0) * (1.0 / worker.index("threads").get().length) : (index) * (worker.index("threads").get().length / this.state.scroll_length) <= this.state.scroll_index && this.state.scroll_index < (index + 1.0) * (worker.index("threads").get().length / this.state.scroll_length) })} style={{ height: `${100 / this.state.scroll_length}%` }} key={index}>
							</button>
						);
					})}
				</section>
			</main>
		);
	}
}
export default Iterable;
