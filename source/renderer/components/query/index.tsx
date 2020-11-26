import * as React from "react";

import "./index.scss";

import suggest from "@/modules/hitomi/suggest";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
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

		listener.on(Scheme.QUERY, ($new: string) => {
			if ($new.length) {
				// clear QUERY data
				query.clear();
				// clear HTML input
				(document.getElementById("input")! as HTMLInputElement).value = "";
			}
		});
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
						// reset
						this.setState({ ...this.state, suggests: [] });
						// increase
						suggest.up();
						// suggest
						suggest.get((event.target as HTMLInputElement).value.split(/\s+/).pop()!.replace(/^-/, "")!).then((callback) => {
							this.setState({ ...this.state, suggests: callback });
						});
					}}
				></input>
				<section id="dropdown" class={utility.inline({ "contrast": this.state.focus && this.state.suggests.length > 0 })}>
					{this.state.suggests.map((value, index) => {
						return (
							<option class="center-y" key={index}>{value.index}:{value.value} ({value.count})</option>
						);
					})}
				</section>
			</section>
		);
	}
}
export default Query;
