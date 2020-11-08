import * as React from "react";

import "./index.scss";

export type TaskBarState = {};

class TaskBar extends React.Component<TaskBarState> {
	public state: TaskBarState;
	constructor(properties: TaskBarState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<section id="taskbar" class="contrast center">Copyright (c) {new Date().getFullYear()} Sombian</section>
		);
	}
}
export default TaskBar;
