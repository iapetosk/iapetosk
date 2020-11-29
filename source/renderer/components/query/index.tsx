import * as React from "react";

import "./index.scss";

import filter from "@/modules/hitomi/filter";
import suggest from "@/modules/hitomi/suggest";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import history from "@/scheme/history";
import paging from "@/scheme/paging";
import query from "@/scheme/query";

import { Scheme } from "@/scheme";
import { Suggestion } from "@/modules/hitomi/suggest";

export type QueryState = {
	focus: boolean,
	suggests: Suggestion;
};

class Query extends React.Component<QueryState> {
	public state: QueryState;
	constructor(properties: QueryState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.QUERY, () => {
			this.setState({ ...this.state, suggests: [] });

			suggest.up();
			paging.set({ ...paging.get(), index: 0, size: 0 });
			history.set_session({ filter: filter.get(this.input().value), index: 0 });
		});
	}
	public input() {
		return document.getElementById("input") as HTMLInputElement;
	}
	public query() {
		return this.input().value.toLowerCase().split(/\s+/).pop()!.split(/:/).pop()!;
	}
	public render() {
		return (
			<section id="query">
				<input id="input" class="contrast" autoComplete="off"
					onFocus={(event) => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={(event) => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={(event) => {
						this.setState({ ...this.state, suggests: [] });

						suggest.up();
						suggest.get(this.query()).then((suggestion) => {
							this.setState({ ...this.state, suggests: suggestion });
						});
					}}
					onKeyDown={(event) => {
						switch (event.key) {
							case "Enter": {
								query.set(this.input().value);
								break;
							}
						}
					}}
				></input>
				<section id="dropdown" class={utility.inline({ "contrast": true, "active": this.state.focus && this.state.suggests.length > 0 })}>
					{this.state.suggests.map((suggestion, index) => {
						return (
							<legend key={index} class="center-y" data-count={suggestion.count}
								onClick={(event) => {
									this.setState({ ...this.state, suggests: [] });

									suggest.up();
									this.input().value = this.input().value.split(/\s+/).map((value, index, array) => {
										return index < array.length - 1 ? value : `${suggestion.index}:${suggestion.value.replace(/\s+/g, "_")}`;
									}).join("\u0020");
								}}
							>
								{suggestion.index}:
								{[...suggestion.value.split(this.query())].map((value, index, array) => {
									return ([
										value,
										index < array.length - 1 ? <strong key={index}>{this.query()}</strong> : undefined
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
