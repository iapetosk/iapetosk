import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import router from "@/scheme/router";
import scroll from "@/scheme/scroll";

import { Scheme } from "@/scheme";

export type ScrollBarState = {
	router: string;
};

class ScrollBar extends React.Component<ScrollBarState> {
	public state: ScrollBarState;
	constructor(properties: ScrollBarState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.SCROLL, () => {
			switch (router.index()) {
				case this.state.router: {
					this.setState({ ...this.state });
					break;
				}
			}
		});
	}
	public render(): JSX.Element {
		return (
			<section id="scrollbar" class="contrast" style={{ display: scroll.get().size ? "block" : "none" }}>
				{[...new Array<number>(scroll.get().metre)].map((value, index) => {
					return (
						<button id="metre" class={utility.inline({ "active": scroll.get().size < scroll.get().metre ? (scroll.get().index) * (1 / scroll.get().size) < (index + 1) / scroll.get().metre && (index + 1) / scroll.get().metre <= (scroll.get().index + 1) * (1 / scroll.get().size) : (index) * (scroll.get().size / scroll.get().metre) <= scroll.get().index && scroll.get().index < (index + 1) * (scroll.get().size / scroll.get().metre) })} style={{ height: `${100 / scroll.get().metre}%` }} key={index}>
						</button>
					);
				})}
			</section>
		);
	}
}
export default ScrollBar;
