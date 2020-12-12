import * as React from "react";

import "./index.scss";

import Query from "@/app/components/query";
import Iterable from "@/app/components/iterable";
import Paging from "@/app/components/paging";

import read from "@/modules/hitomi/read";
import filter from "@/modules/hitomi/filter";
import search from "@/modules/hitomi/search";
import suggest from "@/modules/hitomi/suggest";
import settings from "@/modules/configure";
import listener from "@/modules/listener";
import utility from "@/modules/utility";

import { QueryProps } from "@/app/components/query";
import { IterableProps } from "@/app/components/iterable";
import { PagingProps } from "@/app/components/paging";
import { GalleryBlock } from "@/modules/hitomi/read";

export enum BrowserEvent {
	QUERY = "browser.state.query",
	ITERABLE = "browser.state.iterable",
	PAGING = "browser.state.paging",
	SESSION = "browser.static.session",
	BLOCKS = "browser.static.blocks"
};

export type BrowserProps = {
	enable: boolean;
};
export type BrowserState = {
	query: QueryProps,
	iterable: IterableProps,
	paging: PagingProps,
	session: {
		history: [string, number][],
		version: number;
	},
	blocks: [GalleryBlock[], number];
};

class Browser extends React.Component<BrowserProps> {
	public props: BrowserProps;
	public state: BrowserState;
	constructor(props: BrowserProps) {
		super(props);
		this.props = props;
		this.state = { query: { enable: true, options: { input: settings.query.input }, handler: { keydown: (value: string) => { listener.emit(BrowserEvent.QUERY, value); } } }, iterable: { blocks: [] }, paging: { enable: true, options: { size: 0, index: 0, metre: settings.paging.metre }, handler: { click: (value: number) => { listener.emit(BrowserEvent.PAGING, { ...this.state.paging, options: { ...this.state.paging.options, index: value } }); } } }, session: { history: [], version: 0 }, blocks: [[], 0] };

		listener.on(BrowserEvent.SESSION, ($new: { history: [string, number][], version: number; }) => {
			this.setState({ ...this.state, session: $new }, () => {
				listener.emit(BrowserEvent.BLOCKS, [[], 0]);
				search.get(filter.get($new.history[$new.version][0]), $new.history[$new.version][1], settings.hitomi.per_page).then(({ array, size, singular }) => {
					const blocks = new Array<GalleryBlock>(Math.min(size - settings.hitomi.per_page * $new.history[$new.version][1], settings.hitomi.per_page));
					for (let index = 0; index < blocks.length; index++) {
						read.block(array[index + (singular ? 0 : $new.history[$new.version][1] * settings.hitomi.per_page)]).then((block) => {
							blocks[index] = block;
							if (Object.keys(blocks).length === blocks.length) {
								listener.emit(BrowserEvent.BLOCKS, [blocks, size]);
							}
						});
					}
				});
			});
		});
		listener.on(BrowserEvent.BLOCKS, ($new: [GalleryBlock[], number]) => {
			this.setState({
				...this.state,
				blocks: $new,
				...($new[1] > 0 ? {
					query: {
						...this.state.query,
						enable: true,
					},
					iterable: {
						blocks: $new[0]
					},
					paging: {
						...this.state.paging,
						enable: true,
						options: {
							...this.state.paging.options,
							size: ~~($new[1] / settings.hitomi.per_page)
						}
					}
				} : {
						query: {
							...this.state.query,
							enable: false,
						},
						iterable: {
							blocks: []
						},
						paging: {
							...this.state.paging,
							enable: false
						}
					})
			});
		});
		listener.on(BrowserEvent.QUERY, ($new: QueryProps) => {
			this.setState({ ...this.state, query: $new }, () => {
				listener.emit(BrowserEvent.SESSION, { history: [...this.state.session.history, [$new.options.input, 0]], version: this.state.session.version + 1 });;
			});
			suggest.up();
			settings.query = { ...settings.query, input: $new.options.input }
		});
		listener.on(BrowserEvent.ITERABLE, ($new: IterableProps) => {
			this.setState({ ...this.state, iterable: $new });
		});
		listener.on(BrowserEvent.PAGING, ($new: PagingProps) => {
			this.setState({ ...this.state, paging: $new }, () => {
				listener.emit(BrowserEvent.SESSION, { history: [...this.state.session.history, [settings.query.input, $new.options.index]], version: this.state.session.version + 1 });
			});
		});
	}
	public componentDidMount() {
		listener.emit(BrowserEvent.SESSION, { history: [[settings.query.input, 0]], version: 0 });
	}
	static getDerivedStateFromProps($new: BrowserProps, $old: BrowserProps) {
		return $new;
	}
	public render() {
		return (
			<section id="browser" class={utility.inline({ "enable": this.props.enable, "left": true })}>
				<section id="scrollable" class="scroll-y">
					<Query enable={this.state.query.enable} options={this.state.query.options} handler={this.state.query.handler}></Query>
					<Iterable blocks={this.state.iterable.blocks}></Iterable>
				</section>
				<Paging enable={this.state.paging.enable} options={this.state.paging.options} handler={this.state.paging.handler}></Paging>
			</section>
		);
	}
}
export default Browser;
