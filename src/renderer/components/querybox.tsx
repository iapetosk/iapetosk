import * as React from "react";

import "./querybox.scss";

import listener from "@/modules/listener";
import download from "@/modules/download";
import utility from "@/modules/utility";
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
				// clear QUERY data
				query.set("text", "");
				// clear HTML input
				(document.getElementById("input")! as HTMLInputElement).value = "";
			}
		});
	}
	public render(): JSX.Element {
		return (
			<section id="querybox">
				<input id="input" className="contrast" placeholder={["strongly typed :O", "paste links in here :P", "press enter to start download :D"][utility.random(0, 2)]} autoComplete="off" onKeyDown={(event) => {
					switch (event.key.toLowerCase()) {
						case "enter": {
							query.set("text", (event.target as HTMLInputElement).value);
							break;
						}
					}
				}}>
				</input>
			</section>
		);
	}
}
export default QueryBox;
