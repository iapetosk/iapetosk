import * as React from "react";

import "./index.scss";

import Gallery from "@/app/components/gallery";

import favorite from "@/statics/favorite";
import utility from "@/modules/utility";
import worker from "@/statics/worker";

import { CommonProps } from "@/common";
import { StaticEvent } from "@/statics";
import { GalleryBlock } from "@/modules/hitomi/read";
import { Task, TaskStatus } from "@/modules/download";

export type GalleryListProps = CommonProps & {
	options: {
		blocks: GalleryBlock[];
	},
	handler?: Record<"click", (button: number, key: string, value: string) => void>;
};
export type GalleryListState = {
	[key: number]: {
		task: TaskStatus,
		favorite: boolean;
	};
};

class GalleryList extends React.Component<GalleryListProps, GalleryListState> {
	public props: GalleryListProps;
	public state: GalleryListState;
	constructor(props: GalleryListProps) {
		super(props);
		this.props = props;
		this.state = this.initState();

		window.static.on(StaticEvent.WORKER, (args) => {
			const [$index, $new] = args as [number, Task | undefined, Task | undefined];

			switch ($new ? $new.status : TaskStatus.NONE) {
				case this.state[$index]?.task: {
					break;
				}
				default: {
					this.setState({ ...this.state, [$index]: { ...this.state[$index], task: $new ? $new.status : TaskStatus.NONE } });
					break;
				}
			}
		});
		window.static.on(StaticEvent.FAVORITE, (args) => {
			const [$index, $new] = args as [number, number | undefined, number | undefined];

			this.setState({ ...this.state, [$index]: { ...this.state[$index], favorite: $new } });
		});
	}
	private initState() {
		const state: GalleryListState = {};
		
		for (const task of Object.values(worker.get())) {
			state[task.id] = {
				task: task.status,
				favorite: false
			};
		}
		for (const id of Object.keys(favorite.get())) {
			// @ts-ignore
			state[id] = {
			// @ts-ignore
				...state[id],
			// @ts-ignore
				favorite: favorite.get()[id]
			};
		}
		return state;
	}
	static getDerivedStateFromProps($new: GalleryListProps, $old: GalleryListProps) {
		return $new;
	}
	public render() {
		return (
			<section data-component="gallery.list" id={this.props.id} class={utility.inline({ ...this.props.class })}>
				{this.props.options.blocks.map((gallery, index) => {
					return (
						<Gallery options={{ gallery: gallery, status: { task: this.state[gallery.id]?.task || TaskStatus.NONE, favorite: this.state[gallery.id]?.favorite || false } }} key={index}
							handler={{
								click: (button, key, value) => {
									this.props.handler?.click(button, key, value);
								}
							}}
						></Gallery>
					);
				})}
			</section>
		);
	}
}
export default GalleryList;
