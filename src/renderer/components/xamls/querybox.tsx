import * as React from "react";

import "@/renderer/components/styles/querybox.scss";

import listener from "@/modules/listener";
import download from "@/modules/download";
import utility from "@/modules/utility";
import query from "@/scheme/query";

import { Scheme } from "@/scheme";

export type QueryBoxState = {};

class QueryBox extends React.Component<QueryBoxState> {
	public state: QueryBoxState;
	constructor(properties: QueryBoxState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.QUERY, ($new: string) => {
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
		const placeholders: string[] = [
			"strongly typed 👧🏻",
			"paste links in here 👧🏻",
			"press enter to start download 👧🏻"
		];
		return (
			<section id="querybox">
				<input id="input" className="contrast" placeholder={placeholders[utility.random(0, placeholders.length - 1)]} autoComplete="off"
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
							utility.devide(target.value, target.selectionStart!)[0],
							// clipboard
							event.clipboardData!.getData("text"),
							// after selection
							utility.devide(target.value, target.selectionEnd!).pop()
						].join("");
						
						event.preventDefault();
					}}>
				</input>
			</section>
		);
	}
}
export default QueryBox;
