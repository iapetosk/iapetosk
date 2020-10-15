import * as React from "react";

import "./scrollbar.scss";

import Listener from "@/modules/listener";
import Utility from "@/modules/utility";
import Scroll from "@/scheme/scroll";

import { Scheme } from "@/scheme";

export type ScrollBarState = {};

class ScrollBar extends React.Component<Object, ScrollBarState> {
	public state: ScrollBarState;
	constructor(properties: ScrollBarState) {
		super(properties);
		this.state = { ...properties };

		Listener.on(Scheme.SCROLL, () => {
			this.setState({ ...this.state });
		});
	}
	public render(): JSX.Element {
		return (
			<section id="scrollbar" className="contrast">
				{[...new Array(Scroll.get().length)].map((value, index) => {
					return (
						<button id="metre" className={Utility.inline({ highlight: Scroll.get().size < Scroll.get().length ? (Scroll.get().index) * (1.0 / Scroll.get().size) < (index + 1.0) / Scroll.get().length && (index + 1.0) / Scroll.get().length <= (Scroll.get().index + 1.0) * (1.0 / Scroll.get().size) : (index) * (Scroll.get().size / Scroll.get().length) <= Scroll.get().index && Scroll.get().index < (index + 1.0) * (Scroll.get().size / Scroll.get().length) })} style={{ height: `${100 / Scroll.get().length}%` }} key={index}>
						</button>
					);
				})}
			</section>
		);
	}
}
export default ScrollBar;
