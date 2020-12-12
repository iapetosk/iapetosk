import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

export type PagingProps = {
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
	static getDerivedStateFromProps($new: PagingProps, $old: PagingProps) {
		return $new;
	}
	public render() {
		const I = this;
		function offset(value: number) {
			const breakpoint = ~~(I.props.options.metre / 2);
			const undeflow = (I.props.options.size > I.props.options.metre);
			const viewport = (I.props.options.index > breakpoint && undeflow) ? Math.abs(I.props.options.index - breakpoint) : 0;
			const overflow = (I.props.options.metre + viewport);
	
			return value + viewport + ((overflow > I.props.options.size && undeflow) ? (I.props.options.size - overflow) : 0);
		}
		return (
			<section id="paging" class={utility.inline({ "contrast": true, "center": true, "enable": this.props.enable })}>
				<button id="first" class={utility.inline({ "un_draggable": true, "enable": this.props.options.index !== 0 })}
					onClick={() => {
						this.props.handler.click(0);
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/first.svg") }}>
				</button>
				<button id="backward" class={utility.inline({ "un_draggable": true, "enable": this.props.options.index !== 0 })}
					onClick={() => {
						this.props.handler.click(utility.clamp(this.props.options.index - 1, 0, this.props.options.size - 1));
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/backward.svg") }}>
				</button>
				{[...new Array<number>(Math.min(this.props.options.metre, this.props.options.size))].map((value, index) => {
					return (
						<button class={utility.inline({ "un_draggable": true, "enable": true, "active": this.props.options.index === offset(index) })} key={index}
							onClick={() => {
								this.props.handler.click(offset(index));
							}}
						>{offset(index) + 1}</button>
					);
				})}
				<button id="forward" class={utility.inline({ "un_draggable": true, "enable": this.props.options.index !== this.props.options.size - 1 })}
					onClick={() => {
						this.props.handler.click(utility.clamp(this.props.options.index + 1, 0, this.props.options.size - 1));
					}}
					dangerouslySetInnerHTML={{ __html: require("!html-loader!@/assets/icons/forward.svg") }}>
				</button>
				<button id="last" class={utility.inline({ "un_draggable": true, "enable": this.props.options.index !== this.props.options.size - 1 })}
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
