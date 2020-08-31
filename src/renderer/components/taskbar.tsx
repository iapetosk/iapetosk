import * as React from "react";

import "./taskbar.scss";

export type TaskBarState = {};

class TaskBar extends React.Component<Object, TaskBarState> {
	public state: TaskBarState;
	constructor(properties: TaskBarState) {
		super(properties);
		this.state = { ...properties };
	}
	public render(): JSX.Element {
		return (
			<footer id="taskbar" className="contrast center">Copyright (c) {new Date().getFullYear()} Sombian</footer>
		);
	}
}
export default TaskBar;
