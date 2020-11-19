import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import history from "@/scheme/history";

import { Scheme } from "@/scheme";
import { GalleryIterable } from "@/modules/hitomi";

export type IterableState = {};

class Iterable extends React.Component<IterableState> {
	private static array: GalleryIterable[] = [];
	public state: IterableState;
	constructor(properties: IterableState) {
		super(properties);
		this.state = { ...properties };

		// debug
		history.set({
			filter: {
				"id": [],
				"type": [],
				"language": [],
				"character": [],
				"series": [],
				"artist": [],
				"group": [],
				"tag": [],
				"male": [],
				"female": [],
				"custom": []
			},
			index: 23049
		});

		function update(I: Iterable): void {
			history.iterable().then((iterable) => {
				// assgin
				Iterable.array = iterable;
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
				{Iterable.array.map((value, index) => {
					return (
						<section id="gallery" class="contrast" key={index} style={{
							background: (() => {
								const subdomain: string[] = value.files[0].url.split(/\./g);
								const directory: string[] = value.files[0].url.split(/\//g);

								return `url(${value.files[0].url.replace(subdomain[0], "https://tn").replace(directory[3], "smalltn").replace("png", "jpg")})`;
							})()
						}}>
							<legend id="id">{value.id}</legend>
							<legend id="title">{value.title}</legend>
							<legend id="language">{value.language}</legend>
							{value.tags?.map((value, index) => {
								return <mark key={index}>{value.male ? "male" : value.female ? "female" : "tag"}:{value.tag.replace(/\s/g, "_")}</mark>;
							})}
							<legend id="date">{value.date}</legend>
						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
