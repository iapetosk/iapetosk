import * as React from "react";

import "@/renderer/components/styles/querybox.scss";

import listener from "@/modules/listener";
import utility from "@/modules/utility";
import history from "@/scheme/history";
import hitomi from "@/modules/hitomi";
import query from "@/scheme/query";

import { Scheme } from "@/scheme";
import { Filter, Type, Action } from "@/modules/hitomi";

export type QueryBoxState = {};

class QueryBox extends React.Component<QueryBoxState> {
	public state: QueryBoxState;
	constructor(properties: QueryBoxState) {
		super(properties);
		this.state = { ...properties };

		listener.on(Scheme.QUERY, ($new: string) => {
			// query.clear() also emit listener
			if ($new && $new.length) {
				// create filter
				const filter: Filter = {
					id: [],
					type: [],
					language: [],
					character: [],
					series: [],
					artist: [],
					group: [],
					tag: [],
					male: [],
					female: [],
					custom: []
				};
				// analyze each words
				for (const keyword of $new.split(/\s+/g)) {
					// remove prefix, spacing underscore, split by field and value
					const analyze: string[] = keyword.replace(/^-/, "").replace(/_/g, "%20").split(/:/);
					// vertify field
					switch (analyze[0]) {
						case "id":
						case "type":
						case "language":
						case "character":
						case "series":
						case "artist":
						case "group":
						case "tag":
						case "male":
						case "female":
						case "custom": {
							filter[analyze[0] as Type].push({ action: /^-/.test(keyword) ? Action.NEGATIVE : Action.POSITIVE, value: analyze[1] });
							break;
						}
					}
				}
				// search hitomi
				hitomi.search(filter, { index: 0, size: 25 }).then((callback) => {
					// write history
					history.set([{ filter: filter, index: 0, size: callback.size }]);
					// clear QUERY data
					query.clear();
					// clear HTML input
					(document.getElementById("input")! as HTMLInputElement).value = "";
				});
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
