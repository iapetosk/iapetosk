import * as React from "react";

import "./index.scss";

import suggest from "@/modules/hitomi/suggest";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import query from "@/scheme/query";

import { Scheme } from "@/scheme";

export type QueryState = {};

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
					onChange={(event) => {
						suggest.up();
						suggest.get((event.target as HTMLInputElement).value.split(/\s+/).pop()!.replace(/^-/, "")!).then((callback) => {
							console.log(callback);
						});
					}}
					onPaste={(event) => {
						const target = (event.target as HTMLInputElement);
						target.value = [utility.devide(target.value, target.selectionStart!)[0], event.clipboardData!.getData("text"), utility.devide(target.value, target.selectionEnd!).pop()].join("");

						return event.preventDefault();
					}}>
				</input>
			</section>
		);
	}
}
export default Query;
