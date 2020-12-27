import * as React from "react";

import "./index.scss";

import LazyLoad from "@/app/components/lazyload";

import * as path from "path";
import * as process from "child_process";

import download from "@/modules/download";
import utility from "@/modules/utility";
import worker from "@/statics/worker";
import router from "@/statics/router";

import { GalleryBlock } from "@/modules/hitomi/read";
import { TaskFolder, TaskStatus } from "@/modules/download";

export type IterableProps = {
	options: {
		blocks: GalleryBlock[],
		discovery: string[];
	},
	handler: Record<"click", (button: number, key: string, value: string) => void>;
};
export type IterableState = {
	[key: number]: {
		task: {
			status: TaskStatus
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

class Iterable extends React.Component<IterableProps, IterableState> {
	public props: IterableProps;
	public state: IterableState;
	constructor(props: IterableProps) {
		super(props);
		this.props = props;
		this.state = Object.assign({}, ...Object.values(worker.get()).map((task) => { return { [task.id]: { task: { status: task.status } } }; }));
	}
	static getDerivedStateFromProps($new: IterableProps, $old: IterableProps) {
		return $new;
	}
	public render() {
		return (
			<section id="iterable">
				{this.props.options.blocks.map((gallery, index) => {
					return (
						<section id="gallery" class={utility.inline({ "contrast": true, [TaskStatus[this.state[gallery.id]?.task?.status || TaskStatus.NONE]]: true })} key={index}>
							<section id="upper" class={utility.inline({ "contrast": true, [UpperSection[this.state[gallery.id]?.html?.upper || UpperSection.INTERACTS]]: true })}>
								<LazyLoad src={gallery.thumbnail[0]}></LazyLoad>
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
													{key}:{// @ts-ignore
													utility.wrap(gallery[key]).map((value, index) => {
														return (
															<button id="key" class="contrast center" key={index}>
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
								<section id="interacts" class="contrast center fluid">
									{[
										{
											HTML: require(`!html-loader!@/assets/icons/read.svg`),
											click: () => {
												router.set({ view: "reader", options: gallery.id });
											}
										},
										...(this.state[gallery.id]?.task?.status ? [
										{
											HTML: require(`!html-loader!@/assets/icons/delete.svg`),
											click: () => {
												this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], task: { ...this.state[gallery.id]?.task, status: TaskStatus.NONE } } }, () => {
													download.remove(gallery.id).then(() => {
														// TODO: none
													});
												});
											}
										},
										{
											HTML: require(`!html-loader!@/assets/icons/open.svg`),
											click: () => {
												process.exec(`start "" "${path.join(TaskFolder.DOWNLOADS, String(gallery.id))}"`);
											}
										}] : [
										{
											HTML: require(`!html-loader!@/assets/icons/download.svg`),
											click: () => {
												download.evaluate(`https://hitomi.la/galleries/${gallery.id}.html`).then((task) => {
													this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], task: { ...this.state[gallery.id]?.task, status: TaskStatus.WORKING } } }, () => {
														download.create(task).then(() => {
															this.setState({ ...this.state, [gallery.id]: { ...this.state[gallery.id], task: { ...this.state[gallery.id]?.task, status: TaskStatus.FINISHED } } });
														});
													});
												});
											}
										}]),
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
							<section id="lower" class="center-y">
								<legend id="title" class="eclipse">{gallery.title}</legend>
								<legend id="id" class="center">#{gallery.id}</legend>
							</section>
							<section id="status">
								<legend id="ribbon" class={utility.inline({ "contrast": true, "center": true, "corner": true, "active": this.state[gallery.id]?.task?.status === TaskStatus.FINISHED })}>Downloaded</legend>
							</section>
						</section>
					);
				})}
			</section>
		);
	}
}
export default Iterable;
