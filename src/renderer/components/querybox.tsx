import * as React from "react";

import "./querybox.scss";

import Listener from "@/modules/listener";
import Download from "@/modules/download";
import Utility from "@/modules/utility";
import Query from "@/scheme/query";

import { Scheme } from "@/scheme";

export type QueryBoxState = {};

class QueryBox extends React.Component<QueryBoxState, any> {
	public state: QueryBoxState;
	constructor(properties: QueryBoxState) {
		super(properties);
		this.state = { ...properties };

		Listener.on(Scheme.QUERY, ($new: string) => {
			if ($new && $new.length) {
				$new.split(/\s+/).forEach((link) => {
					Download.evaluate(link).then((callback) => {
						Download.create(callback).then(() => {
							// TODO: none
						});
					});
				});
				// clear QUERY data
				Query.clear();
				// clear HTML input
				(document.getElementById("input")! as HTMLInputElement).value = "";
			}
		});
	}
	public render(): JSX.Element {
		const placeholders: string[] = [
			"strongly typed 👧🏻",
			"paste links in here 👧🏻",
			"press enter to start download 👧🏻"
		];
		return (
			<section id="querybox">
				<input id="input" className="contrast" placeholder={placeholders[Utility.random(0, placeholders.length - 1)]} autoComplete="off"
					onKeyDown={(event) => {
						switch (event.key.toLowerCase()) {
							case "enter": {
								Query.set((event.target as HTMLInputElement).value);
								break;
							}
						}
					}}
					onPaste={(event) => {
						const target = event.target as HTMLInputElement;

						target.value = [
							// before selection
							Utility.split(target.value, target.selectionStart!)[0],
							// clipboard
							event.clipboardData!.getData("text"),
							// after selection
							Utility.split(target.value, target.selectionEnd!).pop()
						].join("");
						
						event.preventDefault();
					}}>
				</input>
			</section>
		);
	}
}
export default QueryBox;
