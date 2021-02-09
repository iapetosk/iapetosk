import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

export type DropDownProps = {
	enable: boolean,
	options: {
		type: "input" | "select",
		items: [string, string][],
		highlight: string;
	},
	handler: Record<"choose" | "change" | "confirm", (value: string) => void>;
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
			<section id="dropdown">
				<input class="contrast" ref={this.refer.input} placeholder={this.state.focus && this.props.options.items.length > 0 && !isNaN(this.state.index) ? this.props.options.items[this.state.index][0] : undefined} readOnly={!this.props.enable || this.props.options.type === "select"}
					onFocus={() => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={() => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={(event) => {
						this.props.handler.change(event.target.value);
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
										this.props.handler.confirm(this.get()!);
									} else {
										this.props.handler.choose(this.props.options.items[this.state.index][0]);
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
							<legend id="item" class={utility.inline({ "center-y": true, "active": this.state.index === index })} data-description={item[1]} key={index}
								onClick={() => {
									this.props.handler.choose(item[0]);
								}}>
								{[...item[0].split(this.props.options.highlight)].map((value, index, array) => {
									return ([
										value,
										index < array.length - 1 ? <strong key={index}>{this.props.options.highlight}</strong> : undefined
									]);
								})}
							</legend>
						);
					})}
				</section>
			</section>
		);
	}
}
export default DropDown;
