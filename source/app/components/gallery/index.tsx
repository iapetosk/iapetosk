import * as React from "react";

import "./index.scss";

import Button from "@/app/components/button";
import LazyLoad from "@/app/components/lazyload";

import * as node_path from "path";
import * as node_process from "child_process";

import language from "@/assets/language.json";

import settings from "@/modules/settings";
import download from "@/modules/download";
import utility from "@/modules/utility";
import router from "@/statics/router";

import { CommonProps } from "@/common";
import { Config } from "@/modules/settings";
import { GalleryBlock } from "@/modules/hitomi/read";
import { TaskStatus } from "@/modules/download";

export type GalleryProps = CommonProps & {
	options: {
		status: TaskStatus,
		gallery: GalleryBlock;
	},
	handler?: Record<"click", (button: number, key: string, value: string) => void>;
};
export type GalleryState = {
	toggle: "unset" | "buttons" | "discovery";
};

const censorship = new RegExp("(" + ["guro", "ryona", "snuff", "blood", "torture", "amputee", "cannibalism"].join("|") + ")");

class Gallery extends React.Component<GalleryProps, GalleryState> {
	readonly config: Config["gallery"] = settings.get().gallery;
	public props: GalleryProps;
	
	public state: GalleryState;
	constructor(props: GalleryProps) {
		super(props);
		this.props = props;
		this.state = {
			toggle: "unset"
		};
	}
	static getDerivedStateFromProps($new: GalleryProps, $old: GalleryProps) {
		return $new;
	}
	public render() {
		return (
			<section data-component="gallery" id={this.props.id} class={utility.inline({ [this.state.toggle]: true, "contrast": true, ...this.props.class })}>
				<section id="upper" class="contrast">
					<LazyLoad class={{ "censorship": this.props.options.gallery.tags ? !isNaN(utility.index_of(this.props.options.gallery.tags, censorship)) : false }} options={{ source: this.props.options.gallery.thumbnail[0] }}></LazyLoad>
					<section id="discovery" class="fluid">
						<section id="buttons">
							<Button class={{ "contrast": true }}
								handler={{
									click: () => {
										this.setState({ ...this.state, toggle: "buttons" });
									}
								}}
							></Button>
						</section>
						<section id="scrollable" class="scroll-y">
							{this.state.toggle !== "unset" ? this.config.discovery.map((key, index) => {
								// @ts-ignore
								return (this.props.options.gallery[key] instanceof Array ? this.props.options.gallery[key].length : this.props.options.gallery[key]) ? (
									<legend id="bundle" key={index}>
										{key}:
										{utility.wrap(this.props.options.gallery[key as keyof GalleryBlock]).map((value, index) => {
											const tag = {
												// @ts-ignore
												key: key === "tags" ? /♂/.test(value) ? "male" : /♀/.test(value) ? "female" : "tag" : key,
												// @ts-ignore
												value: key === "language" ? Object.keys(language)[utility.index_of(Object.values(language), value)] : value
											};
											return (
												<Button id="key" class={{ "contrast": true, "center": true, "censorship": typeof value === "string" ? censorship.test(value) : false }} key={index}
													handler={{
														click: (button) => {
															// @ts-ignore
															this.props.handler?.click(button, tag.key, tag.value.replace(/♂|♀/, "").replace(/^\s|\s$/g, "").replace(/\s+/g, "_"));
														}
													}}
												// @ts-ignore
												><legend id="value" class="eclipse center-x">{key === "tags" ? <><strong id="field" class={tag.key}>{tag.key}</strong>:<>{tag.value.replace(/♂|♀/, "").replace(/^\s|\s$/g, "").replace(/\s+/g, "_")}</></> : tag.value}</legend></Button>
											);
										})}
									</legend>
								) : undefined;
							}) : undefined}
						</section>
					</section>
					<section id="buttons" class="contrast center fluid">
						{[
							{
								html: require(`@/assets/icons/read.svg`),
								click: () => {
									router.set({ view: "viewer", options: this.props.options.gallery.id });
								}
							},
							...(!isNaN(utility.index_of([TaskStatus.WORKING, TaskStatus.FINISHED, TaskStatus.QUEUED], this.props.options.status)) ? [
								{
									html: require(`@/assets/icons/delete.svg`),
									click: () => {
										download.delete(this.props.options.gallery.id).then(() => {
											// TODO: none
										});
									}
								}] : []),
							...(!isNaN(utility.index_of([TaskStatus.WORKING, TaskStatus.FINISHED], this.props.options.status)) ? [
								{
									html: require(`@/assets/icons/open.svg`),
									click: () => {
										download.placeholder(this.props.options.gallery.id).then((folder) => {
											node_process.exec(`start "" "${node_path.resolve(settings.get().download.directory, folder)}"`);
										});
									}
								}] : []),
							...(!isNaN(utility.index_of([TaskStatus.NONE], this.props.options.status)) ? [
								{
									html: require(`@/assets/icons/download.svg`),
									click: () => {
										download.evaluate(`https://hitomi.la/galleries/${this.props.options.gallery.id}.html`).then((task) => {
											download.create(task).then(() => {
												// TODO: none
											});
										});
									}
								}] : []),
							{
								html: require(`@/assets/icons/copy.svg`),
								click: () => {
									navigator.clipboard.writeText(`https://hitomi.la/galleries/${this.props.options.gallery.id}.html`);
								}
							},
							{
								html: require(`@/assets/icons/discovery.svg`),
								click: () => {
									this.setState({ ...this.state, toggle: "discovery" });
								}
							}
						].map(({ html, click }, index) => {
							return (
								<Button key={index}
									handler={{
										click: () => {
											click();
										}
									}}
								>{html}</Button>
							);
						})}
					</section>
				</section>
				<section id="lower" class="center-y">
					<legend id="id" class="center">#{this.props.options.gallery.id}</legend>
					<legend id="title" class="eclipse">{this.props.options.gallery.title}</legend>
				</section>
				<section id="status">
					<legend id="ribbon" class={utility.inline({ [TaskStatus[this.props.options.status]]: true, "contrast": true, "center": true })}>{TaskStatus[this.props.options.status]}</legend>
				</section>
			</section>
		);
	}
}
export default Gallery;
