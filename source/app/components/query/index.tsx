import * as React from "react";

import "./index.scss";

import DropDown from "@/app/components/dropdown";

import utility from "@/modules/utility";
import suggest from "@/modules/hitomi/suggest";

import { CommonProps } from "@/common";
import { Suggestion } from "@/modules/hitomi/suggest";

export type QueryProps = CommonProps & {
	enable: boolean,
	options: {
		value: string;
	},
	handler?: Record<"confirm", (value: string) => void>;
};
export type QueryState = {
	focus: boolean,
	suggest: Suggestion;
};

class Query extends React.Component<QueryProps, QueryState> {
	public props: QueryProps;
	public state: QueryState;
	public refer: { dropdown: React.RefObject<DropDown>; };
	constructor(props: QueryProps) {
		super(props);
		this.props = props;
		this.state = {
			focus: false,
			suggest: []
		};
		this.refer = {
			dropdown: React.createRef()
		};
	}
	public get() {
		return this.refer.dropdown.current?.get();
	}
	public set(value: string) {
		if (this.refer.dropdown.current) {
			this.refer.dropdown.current?.set(value);
		}
	}
	public query() {
		return this.get()?.toLowerCase().split(/\s+/).pop()!.split(/:/).pop()!;
	}
	static getDerivedStateFromProps($new: QueryProps, $old: QueryProps) {
		return $new;
	}
	public render() {
		return (
			<section data-component="query" id={this.props.id} class={utility.inline({ ...this.props.class })}>
				<DropDown
					ref={this.refer.dropdown}
					enable={this.props.enable}
					options={{
						type: "input",
						items: this.state.suggest.map((suggest) => {
							return [`${suggest.index}:${suggest.value}`, String(suggest.count)];
						}),
						highlight: this.query(),
						placeholder: this.props.options.value
					}}
					handler={{
						click: (value) => {
							this.setState({ ...this.state, suggest: [] }, () => {
								suggest.up();
								this.set([...this.get()!.split(/\s+/).slice(0, -1), value.replace(/\s+/g, "_")].join("\u0020"));
							});
						},
						change: () => {
							this.setState({ ...this.state, suggest: [] }, () => {
								suggest.up();
								suggest.get(this.query()).then((suggestion) => {
									this.setState({ ...this.state, suggest: suggestion });
								});
							});
						},
						confirm: () => {
							this.props.handler?.confirm(this.get()!);
						}
					}}
				></DropDown>
			</section>
		);
	}
}
export default Query;
