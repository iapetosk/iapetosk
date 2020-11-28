import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import history from "@/scheme/history";
import gallery from "@/scheme/gallery";
import paging from "@/scheme/paging";

import { Scheme } from "@/scheme";
import { GalleryBlock } from "@/modules/hitomi/read";

export type IterableState = {
	blocks: GalleryBlock[];
};

class Iterable extends React.Component<IterableState> {
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		// initial
		gallery.set(history.get_session());

		listener.on(Scheme.HISTORY, () => {
			// update
			gallery.set(history.get_session());
		});
		listener.on(Scheme.GALLERY, ($new: { blocks: GalleryBlock[], size: number; }) => {
			if ($new.blocks.length && $new.size) {
				// paging
				paging.set({ metre: 10, index: paging.get().index, size: Math.ceil($new.size / 25) });
			}
			// reset
			this.setState({ ...this.state, blocks: $new.blocks });
			// render
			this.forceUpdate();
		});
	}
	public render() {
		return (
			<section id="iterable">
				{this.state.blocks.map((value, index) => {
					return (
						<section id="gallery" class="contrast" key={index}>
							<section id="upper" class="contrast">
								<legend id="thumbnail" class="censored" style={{ background: `url(${value.thumbnail[0]}) no-repeat center / cover` }}></legend>
								<section id="interacts" class="contrast center">
									{[
										{ html: require(`!html-loader!@/assets/icons/read.svg`), click: () => { return; } },
										{ html: require(`!html-loader!@/assets/icons/open.svg`), click: () => { return; } },
										{ html: require(`!html-loader!@/assets/icons/copy.svg`), click: () => { return navigator.clipboard.writeText(`https://hitomi.la/galleries/${value.id}.html`); } }
									].map((value, index) => {
										return (
											<button key={index}
												onClick={() => {
													return value.click();
												}}
												dangerouslySetInnerHTML={{ __html: value.html }}>
											</button>
										);
									})}
								</section>
							</section>
							<section id="lower" class="center-y">
								<legend id="title" class="eclipse">{value.title}</legend>
								<legend id="id" class="center">({value.id})</legend>
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
