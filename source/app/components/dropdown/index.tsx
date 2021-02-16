import * as React from "react";

import "./index.scss";

import Button from "@/app/components/button";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type DropDownProps = CommonProps & {
	enable: boolean,
	options: {
		type: "input" | "select",
		value: string,
		items: [string, string][],
		highlight: string;
	},
	handler?: Record<"click" | "change" | "confirm", (value: string) => void>;
};
export type DropDownState = {
	index: number,
	focus: boolean;
};

class DropDown extends React.Component<DropDownProps, DropDownState> {
	public props: DropDownProps;
	public state: DropDownState;
	public refer: { input: React.RefObject<HTMLInputElement>; };
	constructor(props: DropDownProps) {
		super(props);
		this.props = props;
		this.state = {
			index: NaN,
			focus: false
		};
		this.refer = {
			input: React.createRef()
		};
	}
	public get() {
		return this.refer.input.current?.value;
	}
	public set(value: string) {
		if (this.refer.input.current) {
			this.refer.input.current.value = value;
		}
	}
	static getDerivedStateFromProps($new: DropDownProps, $old: DropDownProps) {
		return $new;
	}
	public render() {
		return (
			<section data-component="dropdown" id={this.props.id} class={utility.inline({ ...this.props.class })}>
				<input class="contrast" ref={this.refer.input} readOnly={!this.props.enable || this.props.options.type === "select"} placeholder={this.props.options.value} defaultValue={this.props.options.value}
					onFocus={() => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={() => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={(event) => {
						this.props.handler?.change(event.target.value);
					}}
					onKeyDown={(event) => {
						if (this.state.focus) {
							switch (event.key) {
								case "ArrowUp": {
									if (!this.state.index) {
										this.setState({ ...this.state, index: NaN });
									} else {
										this.setState({ ...this.state, index: utility.clamp(this.state.index - 1, 0, this.props.options.items.length - 1) });
									}
									break;
								}
								case "ArrowDown": {
									if (isNaN(this.state.index)) {
										this.setState({ ...this.state, index: 0 });
									} else {
										this.setState({ ...this.state, index: utility.clamp(this.state.index + 1, 0, this.props.options.items.length - 1) });
									}
									break;
								}
								case "Enter": {
									if (isNaN(this.state.index)) {
										this.props.handler?.confirm(this.get()!);
									} else {
										this.props.handler?.click(this.props.options.items[this.state.index][0]);
									}
									this.setState({ ...this.state, focus: !isNaN(this.state.index), index: NaN });
									break;
								}
							}
						}
					}}>
				</input>
				<section id="expandable" class={utility.inline({ "active": this.state.focus && this.props.options.items.length > 0, "contrast": true })}>
					{this.props.options.items.map((item, index) => {
						return (
							<Button class={{ "center-y": true, "active": this.state.index === index }} options={{ html: [...item[0].split(this.props.options.highlight)].map((value, index, array) => { return value + (index < array.length - 1 ? `<strong key=${index}>${this.props.options.highlight}</strong>` : ""); }).join("") }} data-description={item[1]} key={index}
								handler={{
									click: () => {
										this.props.handler?.click(item[0]);
									}
								}}
							></Button>
						);
					})}
				</section>
			</section>
		);
	}
}
export default DropDown;
