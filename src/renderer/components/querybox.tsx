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

		listener.on("query.text", ($new: string) => {
			if ($new && $new.length) {
				$new.split(/\s+/).forEach((link) => {
					download.evaluate(link).then((callback) => {
						download.create(callback).then(() => {
							// TODO: none
						});
					});
				});
				// clear QUERY data
				query.clear();
				// clear HTML input
				(document.getElementById("input")! as HTMLInputElement).value = "";
			}
		});
	}
	public render(): JSX.Element {
		return (
			<section id="querybox">
				<input id="input" className="contrast" placeholder={["strongly typed 👧🏻", "paste links in here 👧🏻", "press enter to start download 👧🏻"][utility.random(0, 2)]} autoComplete="off"
					onKeyDown={(event) => {
						switch (event.key.toLowerCase()) {
							case "enter": {
								query.set((event.target as HTMLInputElement).value);
								break;
							}
						}
					}}
					onPaste={(event) => {
						const target = event.target as HTMLInputElement;

						target.value = [
							// before selection
							utility.split(target.value, target.selectionStart!)[0],
							// clipboard
							event.clipboardData!.getData("text"),
							// after selection
							utility.split(target.value, target.selectionEnd!).pop()
						].join("");
						
						event.preventDefault();
					}}>
				</input>
			</section>
		);
	}
}
export default QueryBox;
