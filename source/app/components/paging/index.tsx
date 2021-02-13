import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type PagingProps = CommonProps & {
	enable: boolean,
	options: {
		size: number,
		index: number,
		metre: number;
	},
	handler: Record<"click", (value: number) => void>;
};
export type PagingState = {};

class Paging extends React.Component<PagingProps, PagingState> {
	public props: PagingProps;
	public state: PagingState;
	constructor(props: PagingProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	public get_offset(value: number) {
		const breakpoint = ~~(this.props.options.metre / 2);
		const undeflow = (this.props.options.size > this.props.options.metre);
		const viewport = (this.props.options.index > breakpoint && undeflow) ? Math.abs(this.props.options.index - breakpoint) : 0;
		const overflow = (this.props.options.metre + viewport);

		return value + viewport + ((overflow > this.props.options.size && undeflow) ? (this.props.options.size - overflow) : 0);
	}
	static getDerivedStateFromProps($new: PagingProps, $old: PagingProps) {
		return $new;
	}
	public render() {
		return (
			<section id="paging" class={utility.inline({ "enable": this.props.enable, "contrast": true, "center": true })}>
				<button id="first" class={utility.inline({ "enable": this.props.options.index !== 0, "un_draggable": true })}
					onClick={() => {
						this.props.handler.click(0);
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/first.svg") }}>
				</button>
				<button id="backward" class={utility.inline({ "enable": this.props.options.index !== 0, "un_draggable": true })}
					onClick={() => {
						this.props.handler.click(utility.clamp(this.props.options.index - 1, 0, this.props.options.size - 1));
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/backward.svg") }}>
				</button>
				{[...new Array<number>(Math.min(this.props.options.metre, this.props.options.size))].map((value, index) => {
					return (
						<button class={utility.inline({ "enable": true, "active": this.props.options.index === this.get_offset(index), "un_draggable": true })} key={index}
							onClick={() => {
								this.props.handler.click(this.get_offset(index));
							}}
						>{this.get_offset(index) + 1}</button>
					);
				})}
				<button id="forward" class={utility.inline({ "enable": this.props.options.index !== this.props.options.size - 1, "un_draggable": true })}
					onClick={() => {
						this.props.handler.click(utility.clamp(this.props.options.index + 1, 0, this.props.options.size - 1));
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/forward.svg") }}>
				</button>
				<button id="last" class={utility.inline({ "enable": this.props.options.index !== this.props.options.size - 1, "un_draggable": true })}
					onClick={() => {
						this.props.handler.click(this.props.options.size - 1);
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/last.svg") }}>
				</button>
			</section>
		);
	}
}
export default Paging;
