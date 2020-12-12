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
	constructor(props: QueryProps) {
		super(props);
		this.props = props;
		this.state = { focus: false, suggest: [] };
	}
	static getDerivedStateFromProps($new: QueryProps, $old: QueryProps) {
		return $new;
	}
	public render() {
		const I = this;
		function input() {
			return document.getElementById("input") as HTMLInputElement;
		}
		function query() {
			return input().value.toLowerCase().split(/\s+/).pop()!.split(/:/).pop()!;
		}
		return (
			<section id="query">
				<input id="input" class="contrast" disabled={!this.props.enable} placeholder={this.props.options.input} autoComplete="off"
					onFocus={() => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={() => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={() => {
						this.setState({ ...this.state, suggest: [] }, () => {
							suggest.up();
							suggest.get(query()).then((suggestion) => {
								this.setState({ ...this.state, suggest: suggestion });
							});
						});
					}}
					onKeyDown={(event) => {
						switch (event.key) {
							case "Enter": {
								this.props.handler.keydown(input().value);
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
										input().value = input().value.split(/\s+/).map((value, index, array) => {
											return index < array.length - 1 ? value : `${suggestion.index}:${suggestion.value.replace(/\s+/g, "_")}`;
										}).join("\u0020");
									});
								}}
							>
								{suggestion.index}:
								{[...suggestion.value.split(query())].map((value, index, array) => {
									return ([
										value,
										index < array.length - 1 ? <strong key={index}>{query()}</strong> : undefined
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
