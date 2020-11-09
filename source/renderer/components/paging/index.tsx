import * as React from "react";

import "./index.scss";

import paging from "@/scheme/paging";

import listener from "@/modules/listener";
import utility from "@/modules/utility";

import { Scheme } from "@/scheme";

export type PagingState = {};

class Paging extends React.Component<PagingState> {
	public state: PagingState;
	constructor(properties: PagingState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.PAGING, () => {
			this.setState({ ...this.state });
		});
	}
	public offset(value: number): number {
		const breakpoint: number = ~~(paging.get().metre / 2);
		const undeflow: boolean = (paging.get().size > paging.get().metre);
		const viewport: number = (paging.get().index > breakpoint && undeflow) ? (breakpoint > paging.get().index) ? (breakpoint - paging.get().index) : (paging.get().index - breakpoint) : 0;
		const overflow: number = (paging.get().metre + viewport);

		return value + viewport + ((overflow > paging.get().size && undeflow) ? (paging.get().size - overflow) : 0);
	}
	public render(): JSX.Element {
		return (
			<section id="paging" class="contrast">
				<button id="first" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === 0 })} data-type="stereo"
					onClick={() => {
						return paging.first();
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/first.svg") }}>
				</button>
				<button id="previous" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === 0 })} data-type="stereo"
					onClick={() => {
						return paging.previous();
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/previous.svg") }}>
				</button>
				{[...new Array<number>(paging.get().metre < paging.get().size ? paging.get().metre : paging.get().size)].map((value, index) => {
					return (
						<button class={utility.inline({ "un_draggable": true, "active": paging.get().index === this.offset(index) })} data-type="stereo" key={index}
							onClick={() => {
								return paging.set({ ...paging.get(), index: this.offset(index) });
							}}
						>{this.offset(index) + 1}</button>
					);
				})}
				<button id="next" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === paging.get().size - 1 })} data-type="stereo"
					onClick={() => {
						return paging.next();
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/next.svg") }}>
				</button>
				<button id="last" class={utility.inline({ "un_draggable": true, "disable": paging.get().index === paging.get().size - 1 })} data-type="stereo"
					onClick={() => {
						return paging.last();
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/last.svg") }}>
				</button>
			</section>
		);
	}
}
export default Paging;
