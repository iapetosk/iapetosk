import * as React from "react";

import "./index.scss";

import Query from "@/app/components/query";
import Iterable from "@/app/components/iterable";

import utility from "@/modules/utility";
import worker from "@/scheme/worker";

export type BrowserState = {
	disable: boolean;
};

class Browser extends React.Component<BrowserState> {
	public state: BrowserState;
	constructor(properties: BrowserState) {
		super(properties);
		this.state = { ...properties };
	}
	static getDerivedStateFromProps($new: BrowserState, $old: BrowserState) {
		return $new;
	}
	public render() {
		return (
			<section id="browser" class={utility.inline({ "disable": this.state.disable, "left": true })}>
				<Query focus={false} suggests={[]}></Query>
				<Iterable status={Object.assign({}, ...Object.values(worker.get()).map((task, index) => { return { [task.id]: { task_status: task.status } }; }))} blocks={[]}></Iterable>
			</section>
		);
	}
}
export default Browser;
