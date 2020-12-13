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
import utility from "@/modules/utility";

import { QueryProps } from "@/app/components/query";
import { IterableProps } from "@/app/components/iterable";
import { PagingProps } from "@/app/components/paging";
import { GalleryBlock } from "@/modules/hitomi/read";

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
		this.state = { query: { enable: true, options: { input: settings.query.input }, handler: { keydown: (value: string) => { this.set_query({ ...this.state.query, options: { ...this.state.query.options, input: value } }); } } }, iterable: { blocks: [] }, paging: { enable: true, options: { size: 0, index: 0, metre: settings.paging.metre }, handler: { click: (value: number) => { this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: value } }); } } }, session: { history: [], version: 0 }, blocks: [[], 0] };

		window.addEventListener("keydown", (event) => {
			if (this.props.enable && this.state.iterable.blocks.length && !document.querySelectorAll("input:focus").length) {
				switch (event.key) {
					case "ArrowLeft": {
						this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: utility.clamp(this.state.paging.options.index - 1, 0, this.state.paging.options.size - 1) } });
						break;
					}
					case "ArrowRight": {
						this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: utility.clamp(this.state.paging.options.index + 1, 0, this.state.paging.options.size - 1) } });
						break;
					}
				}
			}
		});
	}
	public set_session(value: BrowserState["session"]) {
		this.setState({ ...this.state, session: value }, () => {
			this.set_blocks([[], 0]);
			search.get(filter.get(value.history[value.version][0]), value.history[value.version][1], settings.hitomi.per_page).then(({ array, size, singular }) => {
				const blocks = new Array<GalleryBlock>(Math.min(size - settings.hitomi.per_page * value.history[value.version][1], settings.hitomi.per_page));
				for (let index = 0; index < blocks.length; index++) {
					read.block(array[index + (singular ? 0 : value.history[value.version][1] * settings.hitomi.per_page)]).then((block) => {
						blocks[index] = block;
						if (Object.keys(blocks).length === blocks.length) {
							this.set_blocks([blocks, size]);
						}
					});
				}
			});
		});
	}
	public set_blocks(value: BrowserState["blocks"]) {
		this.setState({
			...this.state,
			blocks: value,
			...(value[1] > 0 ? {
				query: {
					...this.state.query,
					enable: true,
				},
				iterable: {
					blocks: value[0]
				},
				paging: {
					...this.state.paging,
					enable: true,
					options: {
						...this.state.paging.options,
						size: ~~(value[1] / settings.hitomi.per_page)
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
	}
	public set_query(value: BrowserState["query"]) {
		this.setState({ ...this.state, query: value }, () => {
			this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: 0 } });
		});
		suggest.up();
		settings.query = { ...settings.query, input: value.options.input };
	}
	public set_iterable(value: BrowserState["iterable"]) {
		this.setState({ ...this.state, iterable: value });
	}
	public set_paging(value: BrowserState["paging"]) {
		this.setState({ ...this.state, paging: value }, () => {
			this.set_session({ history: [...this.state.session.history, [this.state.query.options.input, value.options.index]], version: this.state.session.version + 1 });
		});
	}
	static getDerivedStateFromProps($new: BrowserProps, $old: BrowserProps) {
		return $new;
	}
	public componentDidMount() {
		this.set_session({ history: [[settings.query.input, 0]], version: 0 });
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
