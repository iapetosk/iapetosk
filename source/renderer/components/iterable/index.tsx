import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import history from "@/scheme/history";

import { Scheme } from "@/scheme";
import { GalleryBlock } from "@/modules/hitomi/read";
import { SearchAction } from "@/modules/hitomi/search";

export type IterableState = {};

class Iterable extends React.Component<IterableState> {
	public array: GalleryBlock[] = [];
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		// debug
		history.set({
			filter: {
				"id": [],
				"type": [],
				"language": [{ action: SearchAction.POSITIVE, value: "korean" }],
				"character": [],
				"series": [],
				"artist": [],
				"group": [],
				"tag": [{ action: SearchAction.POSITIVE, value: "uncensored" }],
				"male": [],
				"female": [],
				"custom": []
			},
			index: 0
		});

		function update(I: Iterable) {
			history.iterable().then((iterable) => {
				// debug
				console.log(iterable);
				// assgin
				I.array = iterable;
				// update
				I.forceUpdate();
			});
		}
		// initial
		update(this);

		listener.on(Scheme.HISTORY, () => {
			update(this);
		});
	}
	public render() {
		return (
			<section id="iterable">
				{this.array.map((value, index) => {
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
