import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import download from "@/modules/download";
import history from "@/scheme/history";
import gallery from "@/scheme/gallery";
import paging from "@/scheme/paging";

import { Scheme } from "@/scheme";
import { Status } from "@/modules/download";
import { GalleryBlock } from "@/modules/hitomi/read";

export type IterableState = {
	status: Record<number, {
		thread_status: Status;
	}>,
	blocks: GalleryBlock[];
};

class Iterable extends React.Component<IterableState> {
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		gallery.set(history.get_session());

		listener.on(Scheme.HISTORY, () => {
			gallery.set(history.get_session());
		});
		listener.on(Scheme.GALLERY, ($new: { blocks: GalleryBlock[], size: number; }) => {
			if ($new.blocks.length && $new.size) {
				paging.set({ metre: 10, index: paging.get().index, size: Math.ceil($new.size / 25) });
			}
			this.setState({ ...this.state, blocks: $new.blocks });
			this.forceUpdate();
		});
		/*
		listener.on(Scheme.WORKER, ($index: number, $new: Task | undefined) => {
			switch ($new?.status) {
				case this.state.status[$index]?.thread_status: {
					break;
				}
				default: {
					this.setState({ ...this.state, status: { ...this.state.status, [$index]: { ...this.state.status[$index], thread_status: $new ? $new.status : Status.NONE } } });
					break;
				}
			}
		});
		*/
	}
	public render() {
		return (
			<section id="iterable">
				{this.state.blocks.map((gallery, index) => {
					return (
						<section id="gallery" class="contrast" key={index}>
							<section id="upper" class="contrast">
								<legend id="thumbnail" class="censored" style={{ background: `url(${gallery.thumbnail[0]}) no-repeat center / cover` }}></legend>
								<section id="interacts" class="contrast center">
									{[
										{
											HTML: require(`!html-loader!@/assets/icons/read.svg`),
											click: () => {
												// TODO: read
											}
										},
										...(this.state.status[gallery.id]?.thread_status ? [
										{
											HTML: require(`!html-loader!@/assets/icons/delete.svg`),
											click: () => {
												download.remove(gallery.id).then(() => {
													// TODO: none
												});
												this.setState({ ...this.state, status: { ...this.state.status, [gallery.id]: { ...this.state.status[gallery.id], thread_status: Status.NONE } } });
											}
										},
										{
											HTML: require(`!html-loader!@/assets/icons/open.svg`),
											click: () => {
												// TODO: open
										}}] : [
										{
											HTML: require(`!html-loader!@/assets/icons/download.svg`),
											click: () => {
												download.evaluate(`https://hitomi.la/galleries/${gallery.id}.html`).then((task) => {
													download.create(task).then(() => {
														// TODO: none
													});
													this.setState({ ...this.state, status: { ...this.state.status, [gallery.id]: { ...this.state.status[gallery.id], thread_status: Status.WORKING } } });
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
											HTML: require(`!html-loader!@/assets/icons/info.svg`),
											click: () => {
												// TODO: info
											}
										}
									].map((value, index) => {
										return (
											<button key={index}
												onClick={() => {
													value.click();
												}}
												dangerouslySetInnerHTML={{ __html: value.HTML }}>
											</button>
										);
									})}
								</section>
							</section>
							<section id="lower" class="center-y">
								<legend id="title" class="eclipse">{gallery.title}</legend>
								<legend id="id" class="center">({gallery.id})</legend>
							</section>
							{/*
							<legend id="id">{value.id}</legend>
							<legend id="title">{value.title}</legend>
							<legend id="language">{value.language}</legend>
							{value.tags?.map((value, index) => {
								return <mark key={index}>{value.male ? "male" : value.female ? "female" : "tag"}:{value.tag.replace(/\s/g, "_")}</mark>;
							})}
							<legend id="date">{value.date}</legend>
							*/}
						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
