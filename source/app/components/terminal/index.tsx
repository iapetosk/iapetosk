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
	color?: string,
	style?: "normal" | "bold" | "italic";
};

class Terminal extends React.Component<TerminalProps> {
	public props: TerminalProps;
	public state: TerminalState;
	constructor(props: TerminalProps) {
		super(props);
		this.props = props;
		this.state = {
			index: 0,
			history: [{ value: "I'll be thine amaranth", color: "coral" }]
		};
	}
	public write(message: Message[]) {
		this.setState({ ...this.state, index: this.state.index + message.length, history: [...this.state.history, ...message] });
	}
	public error(value: string) {
		this.write([{ value: `(Error) ${value}`, color: "red", style: "italic" }]);
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
						parsed.args[scope.string] = "";
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
			<section data-viewport="terminal" id={this.props.id} class={utility.inline({ "scroll-y": true, ...this.props.class })}>
				<section id="indexing" class="contrast">
					{this.state.history.map((written, index) => {
						return (
							<legend class="center" key={index}>{index}</legend>
						);
					})}
					<legend id="pointer" class="center">⏵</legend>
				</section>
				<section id="history">
					{this.state.history.map((written, index) => {
						return (
							<output class={utility.inline({ [written.style ? written.style : "normal"]: true })} style={{ color: written.color }} key={index}>{written.value}</output>
						);
					})}
					<input placeholder="Type /help for a list of commands"
						onKeyDown={(event) => {
							switch (event.key) {
								case "Enter": {
									const parsed = this.parse((event.target as HTMLInputElement).value);
									// empty string
									if (!parsed.command.length) {
										break;
									}
									// built-in
									const command: TerminalProps["options"] = {
										say: (args: Args, flags: Flags) => {
											if (!Object.values(args).length) {
												return this.error("Invalid arguments");
											}
											this.write([{ value: Object.values(args).join("\u0020"), color: "grey", style: "italic" }]);
										},
										clear: (args: Args, flags: Flags) => {
											this.setState({ ...this.state, index: 0, history: [{ value: "An amaranth that never fades away...", color: "coral" }] });
										},
										help: (args: Args, flags: Flags) => {
											this.write([
												{ value: "List of commands:", style: "bold", color: "grey" },
												...["say", "clear", "help", ...Object.keys(this.props.options)].map((command) => {
													return { value: `-${command}` };
												})
											]);
										},
										...this.props.options
									};
									if (command[parsed.command]) {
										command[parsed.command](parsed.args, parsed.flags);
									} else {
										this.error("Invalid command");
									}
									// reset input
									(event.target as HTMLInputElement).value = "";
									break;
								}
							}
						}}
					></input>
				</section>
			</section>
		);
	}
}
export default Terminal;
