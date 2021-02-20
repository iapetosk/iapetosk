import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type ButtonProps = CommonProps & {
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
	}
	public render() {
		return (
			<button data-component="button" id={this.props.id} class={utility.inline({ "un_draggable": true, ...this.props.class })} {...typeof this.props.children === "string" ? { dangerouslySetInnerHTML: { __html: this.props.children } } : {} }
				onClick={() => {
					this.props.handler?.click();
				}}
			>{typeof this.props.children === "string" ? undefined : this.props.children}</button>
		);
	}
}
export default Button;
