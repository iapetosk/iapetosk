import request from "./request";

import { sha256 } from "js-sha256";

export type Suggest = {
	field: string,
	value: string,
	count: number;
}[];
export type Binary = {
	bytes: DataView,
	index: number;
};
export type Node = {
	field: Uint8Array[],
	value: [number, number][],
	child: number[];
};

// @ts-ignore
DataView.prototype.getUint64 = function (offset: number, little_endian: boolean): number {
	const bytes: number[] = [
		this.getUint32(offset, little_endian),
		this.getUint32(offset + 4, little_endian),
	];
	return little_endian ? bytes[0] + 2 ** 32 * bytes[1] : 2 ** 32 * bytes[0] + bytes[1];
};

class Suggestion {
	private static version: Record<"tagindex" | "galleries" | "languages" | "nozomiurl", string> = { tagindex: "", galleries: "", languages: "", nozomiurl: "" };
	private static serial: number = 0;
	constructor() {
		for (const namespace of ["tagindex"]) {
			request.get(`https://ltn.hitomi.la/${namespace}/version?_=${new Date().getTime()}`).then((callback) => {
				Suggestion.version[namespace as "tagindex" | "galleries" | "languages" | "nozomiurl"] = callback.encode;
			});
		}
	}
	public up(): void {
		Suggestion.serial++;
	}
	public get(query: string): Promise<Suggest> {
		return this.get_suggestions_for_query(query);
	}
	
	private get_suggestions_for_query(query: string): Promise<Suggest> {
		return new Promise<Suggest>((resolve, reject) => {
			query = query.replace(/_/g, "\u0020");

			const serial: number = Suggestion.serial;

			const field: string = new RegExp(/:/).test(query) ? query.split(/:/)[0] : "global";
			const value: string = new RegExp(/:/).test(query) ? query.split(/:/)[1] : query;

			this.get_node_at_address(field, 0, serial).then((callback_1st) => {
				this.B_search(field, new Uint8Array(sha256.array(value).slice(0, 4)), callback_1st, serial).then((callback_2nd) => {
					this.get_suggestions_from_data(field, callback_2nd).then((callback_3rd) => {
						return resolve(callback_3rd);
					});
				});
			});
		});
	}
	private decode_node(bytes: Uint8Array): Node {
		const node: Node = {
			field: [],
			value: [],
			child: []
		};
		const binary: Binary = {
			bytes: new DataView(bytes.buffer),
			index: 0
		};
		const index_size: number = binary.bytes.getInt32(binary.index, false);

		binary.index += 4;

		for (let index: number = 0; index < index_size; index++) {
			const key_size: number = binary.bytes.getInt32(binary.index, false);

			if (key_size === 0 || key_size > 32) {
				throw new Error();
			}
			binary.index += 4;

			node.field.push(bytes.slice(binary.index, binary.index + key_size));

			binary.index += key_size;
		}
		const value_size: number = binary.bytes.getInt32(binary.index, false);

		binary.index += 4;

		for (let index: number = 0; index < value_size; index++) {
			// @ts-ignore
			const offset: number = binary.bytes.getUint64(binary.index, false);

			binary.index += 8;

			const length: number = binary.bytes.getInt32(binary.index, false);

			binary.index += 4;

			node.value.push([offset, length]);
		}

		for (let index: number = 0; index < 17; index++) {
			// @ts-ignore
			node.child.push(binary.bytes.getUint64(binary.index, false));

			binary.index += 8;
		}
		return node;
	}
	private get_node_at_address(field: string, adress: number, serial: number): Promise<Node> {
		return new Promise<Node>((resolve, rejects) => {
			if (serial && serial !== Suggestion.serial) {
				return rejects();
			}
			const URI: string[] = ["https://ltn.hitomi.la/"];

			function recursive(I: Suggestion) {
				switch (Suggestion.version.tagindex.length) {
					case 0: {
						setTimeout(() => {
							return recursive(I);
						}, 250);
						break;
					}
					default: {
						switch (field) {
							case "galleries": {
								URI.push("galleriesindex", "/galleries.", Suggestion.version.galleries, ".index");
								break;
							}
							case "languages": {
								URI.push("languagesindex", "/languages.", Suggestion.version.languages, ".index");
								break;
							}
							case "noromiurl": {
								URI.push("nozomiurlindex", "/nozomiurl.", Suggestion.version.nozomiurl, ".index");
								break;
							}
							default: {
								URI.push("tagindex", `/${field}.`, Suggestion.version.tagindex, ".index");
								break;
							}
						}
						I.get_url_at_range(URI.join(""), [adress, adress + 464 - 1]).then((callback) => {
							if (callback) {
								return resolve(I.decode_node(callback));
							} else {
								return rejects();
							}
						});
						break;
					}
				}
			}
			return recursive(this);
		});
	}
	private get_url_at_range(url: string, range: number[]): Promise<Uint8Array> {
		return new Promise<Uint8Array>((resolve, rejects) => {
			request.get(url, { encoding: "binary", headers: { "range": `bytes=${range[0]}-${range[1]}` } }).then((callback) => {
				return resolve(new Uint8Array(new Buffer(callback.encode, "binary")));
			});
		});
	}
	private B_search(field: string, key: Uint8Array, node: Node, serial: number): Promise<[number, number]> {
		return new Promise<[number, number]>((resolve, rejects) => {
			function mystery_0(first: Uint8Array, second: Uint8Array): [boolean, boolean] {
				for (let index: number = 0; index < (first.byteLength < second.byteLength ? first.byteLength : second.byteLength); index++) {
					if (first[index] < second[index]) {
						return [true, false];
					} else if (first[index] > second[index]) {
						return [false, false];
					}
				}
				return [true, true];
			}
			function mystery_1(key: Uint8Array, node: Node): [boolean, number] {
				let mystery: [boolean, boolean] = [true, false];

				if (!node.field.length) {
					return [false, 0];
				}
				for (let index: number = 0; index < node.field.length; index++) {
					mystery = mystery_0(key, node.field[index]);

					if (mystery[0]) {
						return [mystery[1], index];
					}
				}
				throw new Error();
			}
			function mystery_2(node: Node): boolean {
				for (let index: number = 0; index < node.child.length; index++) {
					if (node.child[index]) {
						return false;
					}
				}
				return true;
			}
			if (!node) {
				return rejects();
			}
			if (!node.field.length) {
				return rejects();
			}
			const [exist, index] = mystery_1(key, node);

			if (exist) {
				return resolve(node.value[index]);
			} else if (mystery_2(node)) {
				return rejects();
			}
			if (node.child[index] == 0) {
				return rejects();
			}
			this.get_node_at_address(field, node.child[index], serial).then((node) => {
				this.B_search(field, key, node, serial).then((node) => {
					return resolve(node);
				});
			});
		});
	}
	private get_suggestions_from_data(field: string, bytes: [number, number]): Promise<Suggest> {
		const suggest: Suggest = [];
		return new Promise<Suggest>((resolve, rejects) => {
			const [offset, length] = bytes;

			if (length > 10000 || length <= 0) {
				return resolve([]);
			}
			this.get_url_at_range(`https://ltn.hitomi.la/tagindex/${field}.${Suggestion.version.tagindex}.data`, [offset, offset + length - 1]).then((callback) => {
				const binary: Binary = {
					bytes: new DataView(callback.buffer),
					index: 0
				};
				const suggests_size: number = binary.bytes.getInt32(binary.index, false);

				binary.index += 4;

				if (suggests_size > 100 || suggests_size <= 0) {
					return resolve([]);
				}
				for (let index: number = 0; index < suggests_size; index++) {
					suggest[index] = ({
						field: "",
						value: "",
						count: 0
					});

					const field_size: number = binary.bytes.getInt32(binary.index, false);

					binary.index += 4;

					for (let $index: number = 0; $index < field_size; $index++) {
						// @ts-ignore
						suggest[index].field += String.fromCharCode(binary.bytes.getUint8(binary.index, false));

						binary.index += 1;
					}
					const value_size: number = binary.bytes.getInt32(binary.index, false);

					binary.index += 4;

					for (let $index: number = 0; $index < value_size; $index++) {
						// @ts-ignore
						suggest[index].value += String.fromCharCode(binary.bytes.getUint8(binary.index, false));

						binary.index += 1;
					}
					suggest[index].count = binary.bytes.getInt32(binary.index, false);

					binary.index += 4;
				}
				return resolve(suggest);
			});
		});
	}
}
export default (new Suggestion());
