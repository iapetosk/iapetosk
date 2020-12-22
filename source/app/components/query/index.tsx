import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";
import suggest from "@/modules/hitomi/suggest";

import { Suggestion } from "@/modules/hitomi/suggest";

export type QueryProps = {
	enable: boolean,
	options: {
		input: string;
	},
	handler: Record<"keydown", (value: string) => void>;
};
export type QueryState = {
	focus: boolean,
	suggest: Suggestion;
};

class Query extends React.Component<QueryProps, QueryState> {
	public props: QueryProps;
	public state: QueryState;
	public refer: Record<"input", HTMLElement | undefined>;
	constructor(props: QueryProps) {
		super(props);
		this.props = props;
		this.state = { focus: false, suggest: [] };
		this.refer = { input: undefined };
	}
	public get_input() {
		return this.refer.input as HTMLInputElement;
	}
	public get_query() {
		return this.get_input().value.toLowerCase().split(/\s+/).pop()!.split(/:/).pop()!;
	}
	static getDerivedStateFromProps($new: QueryProps, $old: QueryProps) {
		return $new;
	}
	public componentDidMount() {
		this.refer.input = document.querySelector("#query > #input") as HTMLElement;
	}
	public render() {
		return (
			<section id="query">
				<input id="input" class="contrast" defaultValue={this.props.options.input} placeholder={this.props.options.input} disabled={!this.props.enable} autoComplete="off"
					onFocus={() => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={() => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={() => {
						this.setState({ ...this.state, suggest: [] }, () => {
							suggest.up();
							suggest.get(this.get_query()).then((suggestion) => {
								this.setState({ ...this.state, suggest: suggestion });
							});
						});
					}}
					onKeyDown={(event) => {
						switch (event.key) {
							case "Enter": {
								this.props.handler.keydown(this.get_input().value);
								break;
							}
						}
					}}
				></input>
				<section id="dropdown" class={utility.inline({ "contrast": true, "active": this.state.focus && this.state.suggest.length > 0 })}>
					{this.state.suggest.map((suggestion, index) => {
						return (
							<legend key={index} class="center-y" data-count={suggestion.count}
								onClick={() => {
									this.setState({ ...this.state, suggest: [] }, () => {
										suggest.up();
										this.get_input().value = this.get_input().value.split(/\s+/).map((value, index, array) => {
											return index < array.length - 1 ? value : `${suggestion.index}:${suggestion.value.replace(/\s+/g, "_")}`;
										}).join("\u0020");
									});
								}}
							>
								{suggestion.index}:
								{[...suggestion.value.split(this.get_query())].map((value, index, array) => {
									return ([
										value,
										index < array.length - 1 ? <strong key={index}>{this.get_query()}</strong> : undefined
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
export default Query;
