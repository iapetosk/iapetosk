import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import * as path from "path";
import * as process from "child_process";

import download from "@/modules/download";
import utility from "@/modules/utility";
import worker from "@/statics/worker";
import router from "@/statics/router";

import { StaticEvent } from "@/statics";
import { GalleryBlock } from "@/modules/hitomi/read";
import { Task, TaskStatus, TaskFolder } from "@/modules/download";

export type IterableProps = {
	options: {
		blocks: GalleryBlock[],
		discovery: string[];
	},
	handler: Record<"click", (button: number, key: string, value: string) => void>;
};
export type IterableState = {
	[key: number]: {
		status: {
			task: TaskStatus
		},
		html: {
			upper: UpperSection
		}
	}
};
export enum UpperSection {
	INTERACTS,
	DISCOVERY
};

const [languages_english, languages_local] = [
	["all", "indonesian", "catalan", "cebuano", "czech", "danish", "german", "estonian", "english", "spanish", "esperanto", "french", "italian", "latin", "hungarian", "dutch", "norwegian", "polish", "portuguese", "romanian", "albanian", "slovak", "finnish", "swedish", "tagalog", "vietnamese", "turkish", "greek", "mongolian", "russian", "ukrainian", "hebrew", "arabic", "persian", "thai", "korean", "chinese", "japanese"],
	["all", "Bahasa Indonesia", "català", "Cebuano", "Čeština", "Dansk", "Deutsch", "eesti", "English", "Español", "Esperanto", "Français", "Italiano", "Latina", "magyar", "Nederlands", "norsk", "polski", "Português", "română", "shqip", "Slovenčina", "Suomi", "Svenska", "Tagalog", "tiếng việt", "Türkçe", "Ελληνικά", "Монгол", "Русский", "Українська", "עברית", "العربية", "فارسی", "ไทย", "한국어", "中文", "日本語"]
];
const censorship = new RegExp("(" + [
	"guro", "ryona", "snuff", "blood", "torture", "amputee", "cannibalism"
// RegExp seperator
].join("|") + ")");

class Iterable extends React.Component<IterableProps, IterableState> {
	public props: IterableProps;
	public state: IterableState;
	constructor(props: IterableProps) {
		super(props);
		this.props = props;
		this.state = Object.assign({}, ...Object.values(worker.get()).map((task) => { return { [task.id]: { status: { task: task.status } } }; }));

		window.static.on(StaticEvent.WORKER, (args) => {
			const [$index, $new] = args as [number, Task | undefined, Task | undefined];
			
			switch ($new ? $new.status : TaskStatus.NONE) {
				case this.state[$index]?.status?.task: {
					break;
				}
				default: {
					this.setState({ ...this.state, [$index]: { ...this.state[$index], status: { ...this.state[$index]?.status, task: $new ? $new.status : TaskStatus.NONE } } });
					break;
				}
			}
		});
	}
	static getDerivedStateFromProps($new: IterableProps, $old: IterableProps) {
		return $new;
	}
	public render() {
		return (
			<section id="iterable">
				{this.props.options.blocks.map((gallery, index) => {
					return (
						<section id="gallery" class={utility.inline({ "contrast": true, [TaskStatus[this.state[gallery.id]?.status?.task || TaskStatus.NONE]]: true })} key={index}>
							<section id="upper" class={utility.inline({ "contrast": true, [UpperSection[this.state[gallery.id]?.html?.upper || UpperSection.INTERACTS]]: true })}>
								{/* thumbnail */}
								<LazyLoad id="thumbnail" class={utility.inline({ "censorship": gallery.tags ? !isNaN(utility.index_of(gallery.tags, censorship)) : false })} src={gallery.thumbnail[0]}></LazyLoad>
								{/* intels */}
								<section id="discovery" class="fluid">
									<section id="interacts">
										<button id="triangle" class="contrast"
											onClick={() => {
												this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], html: { ...this.state[gallery.id]?.html, upper: UpperSection.INTERACTS } } });
											}}>
										</button>
									</section>
									<section id="scrollable" class="scroll-y">
									{(this.state[gallery.id]?.html?.upper === undefined ? [] : this.props.options.discovery).map((key, index) => {
										// @ts-ignore
										if (gallery[key] && utility.wrap(gallery[key]).length) {
											return (
												<legend id="bundle" key={index}>
													{key}:{
													// @ts-ignore
													utility.wrap(gallery[key]).map((value, index) => {
														return (
															<button id="key" class={utility.inline({ "contrast": true, "center": true, "censorship": censorship.test(value) })} key={index}>
																<mark id="value" class="eclipse"
																onMouseUp={(event) => {
																	const [$key, $value] = [/tags/.test(key) ? /♂/.test(value) ? "male" : /♀/.test(value) ? "female" : "tag" : key, /language/.test(key) ? languages_english[utility.index_of(languages_local, value)] : value.replace(/♂|♀/, "").replace(/^\s|\s$/g, "").replace(/\s+/g, "_")];
																	this.props.handler.click(event.button, $key, $value);
																}}>
																{value}</mark>
															</button>
														);
													})}
												</legend>
											);
										}
										return undefined;
									})}
									</section>
								</section>
								{/* buttons */}
								<section id="interacts" class="contrast center fluid">
									{[
										{
											HTML: require(`!html-loader!@/assets/icons/read.svg`),
											click: () => {
												router.set({ view: "reader", options: gallery.id });
											}
										},
										...(this.state[gallery.id]?.status?.task === TaskStatus.WORKING || this.state[gallery.id]?.status?.task === TaskStatus.FINISHED || this.state[gallery.id]?.status?.task === TaskStatus.QUEUED ? [
										{
											HTML: require(`!html-loader!@/assets/icons/delete.svg`),
											click: () => {
												download.destroy(gallery.id).then(() => {
													// TODO: none
												});
											}
										}] : []),
										...(this.state[gallery.id]?.status?.task === TaskStatus.WORKING || this.state[gallery.id]?.status?.task === TaskStatus.FINISHED ? [
											{
												HTML: require(`!html-loader!@/assets/icons/open.svg`),
												click: () => {
													process.exec(`start "" "${path.resolve(TaskFolder.DOWNLOADS, String(gallery.id))}"`);
												}
										}] : []),
										...(!this.state[gallery.id]?.status?.task ? [
										{
											HTML: require(`!html-loader!@/assets/icons/download.svg`),
											click: () => {
												download.evaluate(`https://hitomi.la/galleries/${gallery.id}.html`).then((task) => {
													download.create(task).then(() => {
														// TODO: none
													});
												});
											}
										}] : []),
										{
											HTML: require(`!html-loader!@/assets/icons/copy.svg`),
											click: () => {
												navigator.clipboard.writeText(`https://hitomi.la/galleries/${gallery.id}.html`);
											}
										},
										{
											HTML: require(`!html-loader!@/assets/icons/discovery.svg`),
											click: () => {
												this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], html: { ...this.state[gallery.id]?.html, upper: UpperSection.DISCOVERY } } });
											}
										}
									].map((button, index) => {
										return (
											<button key={index}
												onClick={() => {
													button.click();
												}}
												dangerouslySetInnerHTML={{ __html: button.HTML }}>
											</button>
										);
									})}
								</section>
							</section>
							{/* intels */}
							<section id="lower" class="center-y">
								<legend id="title" class="eclipse">{gallery.title}</legend>
								<legend id="id" class="center">#{gallery.id}</legend>
							</section>
							{/* status */}
							<section id="status" class={utility.inline({ "active": Object.keys({ ...this.state[gallery.id]?.status }).length > 0  })}>
								{[
									{
										type: "ribbon",
										active: this.state[gallery.id]?.status?.task !== TaskStatus.NONE,
										classes: {
											[TaskStatus[this.state[gallery.id]?.status?.task]]: true,
											"contrast": true,
											"center": true,
											"corner": true
										},
										content: TaskStatus[this.state[gallery.id]?.status?.task]
									}
								].map((status, index) => {
									return (
										<legend id={status.type} class={utility.inline({ "active": status.active, ...status.classes })} key={index}>{status.content}</legend>
									);
								})}
							</section>
						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
