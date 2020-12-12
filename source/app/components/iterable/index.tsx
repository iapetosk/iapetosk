import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import * as path from "path";
import * as process from "child_process";

import download from "@/modules/download";
import worker from "@/statics/worker";
import router from "@/statics/router";

import { GalleryBlock } from "@/modules/hitomi/read";
import { Folder, Status } from "@/modules/download";

export type IterableProps = {
	blocks: GalleryBlock[];
};
export type IterableState = {
	[key: number]: {
		task_status: Status
	}
};

class Iterable extends React.Component<IterableProps, IterableState> {
	public props: IterableProps;
	public state: IterableState;
	constructor(props: IterableProps) {
		super(props);
		this.props = props;
		this.state = Object.assign({}, ...Object.values(worker.get()).map((task, index) => { return { [task.id]: { task_status: task.status } }; }));
	}
	static getDerivedStateFromProps($new: IterableProps, $old: IterableProps) {
		return $new;
	}
	public render() {
		return (
			<section id="iterable">
				{this.props.blocks.map((gallery, index) => {
					return (
						<section id="gallery" class="contrast" key={index}>
							<section id="upper" class="contrast">
								<LazyLoad src={gallery.thumbnail[0]}></LazyLoad>
								<section id="interacts" class="contrast center">
									{[
										{
											HTML: require(`!html-loader!@/assets/icons/read.svg`),
											click: () => {
												router.set({ view: "reader", options: gallery.id });
											}
										},
										...(this.state[gallery.id]?.task_status ? [
										{
											HTML: require(`!html-loader!@/assets/icons/delete.svg`),
											click: () => {
												this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], task_status: Status.NONE } }, () => {
													download.remove(gallery.id).then(() => {
														// TODO: none
													});
												});
											}
										},
										{
											HTML: require(`!html-loader!@/assets/icons/open.svg`),
											click: () => {
												process.exec(`start "" "${path.join(Folder.DOWNLOADS, String(gallery.id))}"`);
											}
										}] : [
										{
											HTML: require(`!html-loader!@/assets/icons/download.svg`),
											click: () => {
												download.evaluate(`https://hitomi.la/galleries/${gallery.id}.html`).then((task) => {
													this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], task_status: Status.WORKING } }, () => {
														download.create(task).then(() => {
															// TODO: none
														});
													});
												});
											}
										}]),
										{
											HTML: require(`!html-loader!@/assets/icons/copy.svg`),
											click: () => {
												navigator.clipboard.writeText(`https://hitomi.la/galleries/${gallery.id}.html`);
											}
										},
										{
											HTML: require(`!html-loader!@/assets/icons/discovery.svg`),
											click: () => {
												// TODO: info
											}
										}
									].map((button, index) => {
										return (
											<button key={index}
												onClick={() => {
													button.click();
												}}
												dangerouslySetInnerHTML={{ __html: button.HTML }}>
											</button>
										);
									})}
								</section>
							</section>
							<section id="lower" class="center-y">
								<legend id="title" class="eclipse">{gallery.title}</legend>
								<legend id="id" class="center">#{gallery.id}</legend>
							</section>
						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
