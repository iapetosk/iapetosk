import * as React from "react";

import "./index.scss";

import Terminal from "@/app/components/terminal";

import utility from "@/modules/utility";
import download from "@/modules/download";
import search from "@/modules/hitomi/search";
import filter from "@/modules/hitomi/filter";

export type OverlayProps = {
	enable: boolean;
	// Preference | Confirm | Terminal
};
export type OverlayState = {};

class Overlay extends React.Component<OverlayProps> {
	public props: OverlayProps;
	public state: OverlayState;
	public refer: { terminal: React.RefObject<Terminal>; };
	constructor(props: OverlayProps) {
		super(props);
		this.props = props;
		this.state = {};
		this.refer = {
			terminal: React.createRef()
		};
	}
	static getDerivedStateFromProps($new: OverlayProps, $old: OverlayProps) {
		return $new;
	}
	public render() {
		return (
			<section data-viewport="overlay" class={utility.inline({ "enable": this.props.enable, "center": true })}>
				<section id="overlay" class="contrast center">
					<Terminal ref={this.refer.terminal} options={{
						// Prefix.EXCLUDE tags are considered as argument given how terminal parse the query
						download: (args, flags) => {
							if (!Object.keys(args).length) {
								return this.refer.terminal.current?.error("Invalid Argument");
							}
							this.refer.terminal.current?.write([{ value: `Downloading...`, color: "grey" }]); let count = 0;

							search.get(filter.get((Object.keys(args).map((key) => { return /[0-9]+/.test(key) ? args[key] : "-" + key }).join("\u0020"))), 0, 0).then((galleries) => {
								for (const gallery of galleries.array) {
									download.evaluate(`https://hitomi.la/galleries/${gallery}.html`).then((task) => {
										download.create(task).then(() => {
											count++;
											this.refer.terminal.current?.write([{ value: `Created (${count}/${galleries.array.length})` }]);
										});
									})
								}
							});
						},
						delete: (args, flags) => {
							if (!Object.keys(args).length) {
								return this.refer.terminal.current?.error("Invalid Argument");
							}
							this.refer.terminal.current?.write([{ value: `Deleting...`, color: "grey" }]); let count = 0;

							search.get(filter.get((Object.keys(args).map((key) => { return /[0-9]+/.test(key) ? args[key] : "-" + key }).join("\u0020"))), 0, 0).then((galleries) => {
								for (const gallery of galleries.array) {
									download.delete(gallery).then(() => {
										count++;
										this.refer.terminal.current?.write([{ value: `Deleted (${count}/${galleries.array.length})` }]);
									});
								}
							});
						}
					}}></Terminal>
				</section>
			</section>
		);
	}
}
export default Overlay;
