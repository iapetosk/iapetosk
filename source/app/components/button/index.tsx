import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type ButtonProps = CommonProps & {
	options: {
		html: string;
	},
	handler?: Record<"click", () => void>;
};
export type ButtonState = {};

class Button extends React.Component<ButtonProps, ButtonState> {
	public props: ButtonProps;
	public state: ButtonState;
	constructor(props: ButtonProps) {
		super(props);
		this.props = props;
		this.state = {};

		console.log(this.props);
	}
	public render() {
		return (
			<button data-component="button" id={this.props.id} class={utility.inline({ "un_draggable": true, ...this.props.class })} dangerouslySetInnerHTML={{ __html: this.props.options.html }}
				onClick={() => {
					this.props.handler?.click();
				}}
			></button>
		);
	}
}
export default Button;
