import * as React from "react";

import "./querybox.scss";

import listener from "@/modules/listener";
import download from "@/modules/download";
import query from "@/scheme/query";

export type QueryBoxState = {};

class QueryBox extends React.Component<QueryBoxState, any> {
	public state: QueryBoxState;
	constructor(properties: QueryBoxState) {
		super(properties);
		this.state = { ...properties };

		listener.on("query_text", ($new: string) => {
			if ($new && $new.length) {
				$new.split(/\s+/).forEach((link) => {
					download.modulator(link).then((callback) => {
						download.start(callback).then(() => {
							// TODO: none
						});
					});
				});
				query.set("text", "");
			}
			(document.getElementById("input")! as HTMLInputElement).value = "";
		});
	}
	public render(): JSX.Element {
		return (
			<section id="querybox">
				<input id="input" className="contrast" placeholder="type url in here" autoComplete="off" onKeyDown={(event) => {
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
