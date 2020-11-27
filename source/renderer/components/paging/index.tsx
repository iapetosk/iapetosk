import * as React from "react";

import "./index.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import history from "@/scheme/history";
import paging from "@/scheme/paging";

import { Scheme } from "@/scheme";

export type PagingState = {};

class Paging extends React.Component<PagingState> {
	public state: PagingState;
	constructor(properties: PagingState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.PAGING, () => {
			// render
			this.forceUpdate();
		});
		window.addEventListener("keydown", (event) => {
			// check for focused input
			if (!document.querySelectorAll("input:focus").length) {
				switch (event.key) {
					case "ArrowLeft": {
						paging.backward();
						break;
					}
					case "ArrowRight": {
						paging.forward();
						break;
					}
				}
				history.set_session({ ...history.get_session(), index: paging.get().index });
				// for reason unknown, DOM don't update correctly despite Scheme.PAGING is triggered.
				this.forceUpdate();
			}
		});
	}
	public offset(value: number) {
		const breakpoint = ~~(paging.get().metre / 2);
		const undeflow = (paging.get().size > paging.get().metre);
		const viewport = (paging.get().index > breakpoint && undeflow) ? Math.abs(paging.get().index - breakpoint) : 0;
		const overflow = (paging.get().metre + viewport);

		return value + viewport + ((overflow > paging.get().size && undeflow) ? (paging.get().size - overflow) : 0);
	}
	public render() {
		return (
			<section id="paging" class="contrast center">
				<button id="first" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === 0 })}
					onClick={() => {
						paging.first();
						history.set_session({ ...history.get_session(), index: paging.get().index });
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/first.svg") }}>
				</button>
				<button id="backward" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === 0 })}
					onClick={() => {
						paging.backward();
						history.set_session({ ...history.get_session(), index: paging.get().index });
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/backward.svg") }}>
				</button>
				{[...new Array<number>(Math.min(paging.get().metre, paging.get().size))].map((value, index) => {
					return (
						<button class={utility.inline({ "un_draggable": true, "active": paging.get().index === this.offset(index) })} key={index}
							onClick={() => {
								paging.set({ ...paging.get(), index: this.offset(index) });
								history.set_session({ ...history.get_session(), index: paging.get().index });
							}}
						>{this.offset(index) + 1}</button>
					);
				})}
				<button id="forward" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === paging.get().size - 1 })}
					onClick={() => {
						paging.forward();
						history.set_session({ ...history.get_session(), index: paging.get().index });
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/forward.svg") }}>
				</button>
				<button id="last" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === paging.get().size - 1 })}
					onClick={() => {
						paging.last();
						history.set_session({ ...history.get_session(), index: paging.get().index });
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/last.svg") }}>
				</button>
			</section>
		);
	}
}
export default Paging;
