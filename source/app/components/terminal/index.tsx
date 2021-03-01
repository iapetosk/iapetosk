import * as React from "react";

import "./index.scss";

import utility from "@/modules/utility";

import { CommonProps } from "@/common";

export type TerminalProps = CommonProps & {
	options: Record<string, (args: Args, flags: Flags) => void>;
};
export type TerminalState = {
	index: number,
	history: Message[];
};
export type Args = Record<string, string>;
export type Flags = Record<string, boolean>;
export type Message = {
	value: string,
	color: string,
	style: "normal" | "bold" | "italic";
};

class Terminal extends React.Component<TerminalProps> {
	public props: TerminalProps;
	public state: TerminalState;
	constructor(props: TerminalProps) {
		super(props);
		this.props = props;
		this.state = {
			index: 0,
			history: [{ value: "Earth is flat. So are you.", color: "green", style: "bold" }]
		};
	}
	public write(message: Message) {
		this.setState({ ...this.state, index: this.state.index + 1, history: [...this.state.history, message] });
	}
	public parse(value: string) {
		const parsed = {
			args: {} as Args,
			flags: {} as Flags,
			command: ""
		};
		const scope = {
			string: "",
			number: 0
		};
		for (const [index, fragment] of (value + "\u0020").split(/\s+/).entries()) {
			if (!index) {
				parsed.command = fragment.toLowerCase();
			} else if (fragment.length) {
				const [unused, prefix, content] = /^([-]*)([\D\d]+)$/.exec(fragment)!;

				switch (prefix.length) {
					case 0: {
						if (scope.string.length) {
							parsed.args[scope.string] = content;
							scope.string = "";
						} else {
							parsed.args[scope.number] = content;
							scope.number++;
						}
						break;
					}
					case 1: {
						scope.string = content;
						break;
					}
					case 2: {
						parsed.flags[content] = true;
						break;
					}
				}
			}
		}
		return parsed;
	}
	static getDerivedStateFromProps($new: TerminalProps, $old: TerminalProps) {
		return $new;
	}
	public render() {
		return (
			<section data-viewport="terminal" id={this.props.id} class={utility.inline({ ...this.props.class })}>
				{this.state.history.map((written, index) => {
					return (
						<output class={utility.inline({ [written.style]: true })} style={{ color: written.color }} data-description={index} key={index}>{written.value}</output>
					);
				})}
				<input
					onKeyDown={(event) => {
						switch (event.key) {
							case "Enter": {
								const parsed = this.parse((event.target as HTMLInputElement).value);
								// built-in
								const command: TerminalProps["options"] = {
									clear: (args: Args, flags: Flags) => {
										this.setState({ ...this.state, index: 0, history: [{ value: "Earth is flat. So are you.", color: "green", style: "bold" }] });
									},
									write: (args: Args, flags: Flags) => {
										this.write({ value: args[0], color: "grey", style: "italic" });
									},
									...this.props.options
								};
								if (command[parsed.command]) {
									command[parsed.command](parsed.args, parsed.flags);
								} else {
									this.write({ value: `[Error] "${parsed.command}" is invalid command.`, color: "red", style: "bold" });
								}
								break;
							}
						}
					}}
				></input>
			</section>
		);
	}
}
export default Terminal;
