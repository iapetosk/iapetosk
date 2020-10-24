import * as React from "react";

import "@/renderer/components/styles/scrollbar.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import scroll from "@/scheme/scroll";

import { Scheme } from "@/scheme";

export type scrollBarState = {};

class scrollBar extends React.Component<Object, scrollBarState> {
	public state: scrollBarState;
	constructor(properties: scrollBarState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.SCROLL, () => {
			this.setState({ ...this.state });
		});
	}
	public render(): JSX.Element {
		return (
			<section id="scrollbar" className="contrast">
				{[...new Array(scroll.get().length)].map((value, index) => {
					return (
						<button id="metre" className={utility.inline({ highlight: scroll.get().size < scroll.get().length ? (scroll.get().index) * (1.0 / scroll.get().size) < (index + 1.0) / scroll.get().length && (index + 1.0) / scroll.get().length <= (scroll.get().index + 1.0) * (1.0 / scroll.get().size) : (index) * (scroll.get().size / scroll.get().length) <= scroll.get().index && scroll.get().index < (index + 1.0) * (scroll.get().size / scroll.get().length) })} style={{ height: `${100 / scroll.get().length}%` }} key={index}>
						</button>
					);
				})}
			</section>
		);
	}
}
export default scrollBar;
