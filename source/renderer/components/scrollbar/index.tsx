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
			<section id="scrollbar" class="contrast">
				{[...new Array(scroll.get().length)].map((value, index) => {
					return (
						<button id="metre" class={utility.inline({ highlight: scroll.get().size < scroll.get().length ? (scroll.get().index) * (1.0 / scroll.get().size) < (index + 1.0) / scroll.get().length && (index + 1.0) / scroll.get().length <= (scroll.get().index + 1.0) * (1.0 / scroll.get().size) : (index) * (scroll.get().size / scroll.get().length) <= scroll.get().index && scroll.get().index < (index + 1.0) * (scroll.get().size / scroll.get().length) })} style={{ height: `${100 / scroll.get().length}%` }} key={index}>
						</button>
					);
				})}
			</section>
		);
	}
}
export default ScrollBar;
