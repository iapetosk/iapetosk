import * as React from "react";

import "./index.scss";

import Button from "@/app/components/button";

import utility from "@/modules/utility";
import settings from "@/modules/settings";

import { CommonProps } from "@/common";
import { Config } from "@/modules/settings";

export type PagingProps = CommonProps & {
	enable: boolean,
	options: {
		size: number,
		index: number;
	},
	handler?: Record<"click", (value: number) => void>;
};
export type PagingState = {};

class Paging extends React.Component<PagingProps, PagingState> {
	readonly config: Config["paging"] = settings.get().paging;
	public props: PagingProps;
	public state: PagingState;
	constructor(props: PagingProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	public get_offset(value: number) {
		const breakpoint = ~~(this.config.metre / 2);
		const undeflow = (this.props.options.size > this.config.metre);
		const viewport = (this.props.options.index > breakpoint && undeflow) ? Math.abs(this.props.options.index - breakpoint) : 0;
		const overflow = (this.config.metre + viewport);

		return value + viewport + ((overflow > this.props.options.size && undeflow) ? (this.props.options.size - overflow) : 0);
	}
	static getDerivedStateFromProps($new: PagingProps, $old: PagingProps) {
		return $new;
	}
	public render() {
		return (
			<section data-component="paging" id={this.props.id} class={utility.inline({ "enable": this.props.enable, "active": this.props.options.size > 1, "contrast": true, "center": true, ...this.props.class })}>
				<Button id="first" class={{ "enable": this.props.options.index !== 0 }}
					handler={{
						click: () => {
							this.props.handler?.click(0);
						}
					}}
				>{require(`@/assets/icons/first.svg`)}</Button>
				<Button id="backward" class={{ "enable": this.props.options.index !== 0 }}
					handler={{
						click: () => {
							this.props.handler?.click(utility.clamp(this.props.options.index - 1, 0, this.props.options.size - 1));
						}
					}}
				>{require(`@/assets/icons/backward.svg`)}</Button>
				{[...new Array<number>(Math.min(this.config.metre, this.props.options.size))].map((value, index) => {
					return (
						<Button class={{ "enable": true, "active": this.props.options.index === this.get_offset(index) }} key={index}
							handler={{
								click: () => {
									this.props.handler?.click(this.get_offset(index));
								}
							}}
						>{String(this.get_offset(index) + 1)}</Button>
					);
				})}
				<Button id="forward" class={{ "enable": this.props.options.index !== this.props.options.size - 1 }}
					handler={{
						click: () => {
							this.props.handler?.click(utility.clamp(this.props.options.index + 1, 0, this.props.options.size - 1));
						}
					}}
				>{require(`@/assets/icons/forward.svg`)}</Button>
				<Button id="last" class={{ "enable": this.props.options.index !== this.props.options.size - 1 }}
					handler={{
						click: () => {
							this.props.handler?.click(this.props.options.size - 1);
						}
					}}
				>{require(`@/assets/icons/last.svg`)}</Button>
			</section>
		);
	}
}
export default Paging;
