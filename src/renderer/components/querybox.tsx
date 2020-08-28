import query from "@/scheme/query";
import * as React from "react";

import "./querybox.scss";

export type QueryBoxState = {};

class QueryBox extends React.Component<QueryBoxState, any> {
	public state: QueryBoxState;
	constructor(properties: QueryBoxState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<section id="querybox">
				<input id="query" className="contrast" autoComplete="off" defaultValue={query.get("text")} onKeyDown={(event) => {
					if (event.key === "Enter") {
						query.set("text", (event.target as HTMLInputElement).value);
					}
				}}>
				</input>
			</section>
		);
	}
}
export default QueryBox;
