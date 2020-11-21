import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import history from "@/scheme/history";

import { Scheme } from "@/scheme";
import { Action, GalleryIterable } from "@/modules/hitomi";

export type IterableState = {};

class Iterable extends React.Component<IterableState> {
	public array: GalleryIterable[] = [];
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		// debug
		history.set({
			filter: {
				"id": [],
				"type": [],
				"language": [{ action: Action.POSITIVE, value: "korean" }],
				"character": [],
				"series": [],
				"artist": [],
				"group": [],
				"tag": [],
				"male": [],
				"female": [{ action: Action.POSITIVE, value: "tomboy" }],
				"custom": []
			},
			index: 0
		});

		function update(I: Iterable): void {
			history.iterable().then((iterable) => {
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
	public render(): JSX.Element {
		return (
			<section id="iterable">
				{this.array.map((value, index) => {
					return (
						<section id="gallery" class="contrast center" key={index}>
							<canvas id="thumbnail" class="contrast" style={{ background: `url(${value.thumbnail[0]}) no-repeat center / cover` }}></canvas>
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
