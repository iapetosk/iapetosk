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
						<section id="gallery" class="contrast" key={index}>

						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
