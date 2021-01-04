import request from "../request";

import { sha256 } from "js-sha256";

export type Suggestion = {
	index: string,
	value: string,
	count: number;
}[];
export type SuggestBinary = {
	index: number,
	bytes: DataView;
};
export type SuggestBundle = {
	index: Uint8Array[],
	value: [number, number][],
	child: number[];
};

// @ts-ignore
DataView.prototype.getUint64 = function (offset: number, little_endian: boolean) {
	const bytes: number[] = [
		this.getUint32(offset, little_endian),
		this.getUint32(offset + 4, little_endian),
	];
	return little_endian ? bytes[0] + 2 ** 32 * bytes[1] : 2 ** 32 * bytes[0] + bytes[1];
};

class Suggest {
	private version = { tagindex: "", galleries: "", languages: "", nozomiurl: "" };
	private serial = 0;
	constructor() {
		for (const namespace of ["tagindex"]) {
			request.GET(`https://ltn.hitomi.la/${namespace}/version?_=${new Date().getTime()}`).then((response) => {
				this.version[namespace as "tagindex" | "galleries" | "languages" | "nozomiurl"] = response.encode;
			});
		}
	}
	public up() {
		this.serial++;
	}
	public get(query: string) {
		return this.unknown_0(query.replace(/_/g, "\u0020"));
	}
	// @see search.js > get_suggestions_for_query
	private unknown_0(query: string) {
		const I = this;
		return new Promise<Suggestion>((resolve, reject) => {
			const [field, value] = /:/.test(query) ? query.split(/:/) : ["global", query], serial: number = this.serial;

			function condition() {
				if (serial && serial !== I.serial) {
					return resolve([]);
				}
			}
			this.unknown_3(field, 0).then((bundle) => {
				condition();
				this.unknown_5(field, this.unknown_1(value), bundle).then((bytes) => {
					condition();
					this.unknown_6(field, bytes).then((suggest) => {
						condition();
						return resolve(suggest);
					});
				});
			});
		});
	}
	// @see searchlib.js > hash_term
	private unknown_1(value: string) {
		return new Uint8Array(sha256.array(value).slice(0, 4));
	}
	// @see search.js > decode_node
	private unknown_2(bytes: Uint8Array) {
		const bundle: SuggestBundle = {
			index: [],
			value: [],
			child: []
		};
		const binary: SuggestBinary = {
			bytes: new DataView(bytes.buffer),
			index: 0
		};
		const index_size = binary.bytes.getInt32(binary.index, false);

		binary.index += 4;

		for (let index = 0; index < index_size; index++) {
			const key_size = binary.bytes.getInt32(binary.index, false);

			if (key_size === 0 || key_size > 32) {
				throw new Error();
			}
			binary.index += 4;

			bundle.index.push(bytes.slice(binary.index, binary.index + key_size));

			binary.index += key_size;
		}
		const value_size = binary.bytes.getInt32(binary.index, false);

		binary.index += 4;

		for (let index = 0; index < value_size; index++) {
			// @ts-ignore
			const offset = binary.bytes.getUint64(binary.index, false);

			binary.index += 8;

			const length = binary.bytes.getInt32(binary.index, false);

			binary.index += 4;

			bundle.value.push([offset, length]);
		}
		for (let index = 0; index < 17; index++) {
			// @ts-ignore
			bundle.child.push(binary.bytes.getUint64(binary.index, false));

			binary.index += 8;
		}
		return bundle;
	}
	// @see search.js > get_node_at_address
	private unknown_3(field: string, adress: number) {
		const I = this;
		return new Promise<SuggestBundle>((resolve, reject) => {
			function recursive() {
				switch (I.version.tagindex.length) {
					case 0: {
						setTimeout(() => {
							return recursive();
						}, 250);
						break;
					}
					default: {
						I.unknown_4(`https://ltn.hitomi.la/${field.replace("global", "tag")}index/${field}.${I.version[field.replace("global", "tagindex") as never]}.index`, [adress, adress + 464 - 1]).then((callback) => {
							if (callback) {
								return resolve(I.unknown_2(callback));
							} else {
								return reject();
							}
						});
						break;
					}
				}
			}
			return recursive();
		});
	}
	// @see search.js > get_url_at_range
	private unknown_4(url: string, range: [number, number]) {
		return new Promise<Uint8Array>((resolve, reject) => {
			request.GET(url, { headers: { "range": `bytes=${range[0]}-${range[1]}` } }, "binary").then((response) => {
				return resolve(new Uint8Array(Buffer.from(response.encode, "binary")));
			});
		});
	}
	// @see search.js > B_search
	private unknown_5(field: string, key: Uint8Array, bundle: SuggestBundle) {
		return new Promise<[number, number]>((resolve, reject) => {
			function mystery_0(first: Uint8Array, second: Uint8Array): [boolean, boolean] {
				for (let index = 0; index < (first.byteLength < second.byteLength ? first.byteLength : second.byteLength); index++) {
					if (first[index] < second[index]) {
						return [true, false];
					} else if (first[index] > second[index]) {
						return [false, false];
					}
				}
				return [true, true];
			}
			function mystery_1(key: Uint8Array, bundle: SuggestBundle): [boolean, number] {
				let value: [boolean, boolean] = [true, false];

				for (let index = 0; index < bundle.index.length; index++) {
					value = mystery_0(key, bundle.index[index]);
					if (value[0]) {
						return [value[1], index];
					}
				}
				if (bundle.index.length) {
					return [value[1], bundle.index.length];
				}
				return [true, 0];
			}
			function mystery_2(bundle: SuggestBundle) {
				for (let index = 0; index < bundle.child.length; index++) {
					if (bundle.child[index]) {
						return false;
					}
				}
				return true;
			}
			if (!bundle || !bundle.index.length) {
				return reject();
			}
			const [exist, index] = mystery_1(key, bundle);

			if (exist) {
				return resolve(bundle.value[index]);
			} else if (mystery_2(bundle)) {
				return reject();
			}
			if (!bundle.child[index]) {
				return reject();
			}
			this.unknown_3(field, bundle.child[index]).then((bundle) => {
				this.unknown_5(field, key, bundle).then((bundle) => {
					return resolve(bundle);
				});
			});
		});
	}
	// @see search.js > get_suggestions_from_data
	private unknown_6(field: string, bytes: [number, number]) {
		const suggest: Suggestion = [];
		return new Promise<Suggestion>((resolve, reject) => {
			const [offset, length] = bytes;

			if (length > 10000 || length <= 0) {
				return resolve([]);
			}
			this.unknown_4(`https://ltn.hitomi.la/tagindex/${field}.${this.version.tagindex}.data`, [offset, offset + length - 1]).then((response) => {
				const binary: SuggestBinary = {
					bytes: new DataView(response.buffer),
					index: 0
				};
				const suggests_size = binary.bytes.getInt32(binary.index, false);

				binary.index += 4;

				if (suggests_size > 100 || suggests_size <= 0) {
					return resolve([]);
				}
				for (let index = 0; index < suggests_size; index++) {
					suggest[index] = ({
						index: "",
						value: "",
						count: 0
					});
					const field_size = binary.bytes.getInt32(binary.index, false);

					binary.index += 4;

					for (let $index = 0; $index < field_size; $index++) {
						// @ts-ignore
						suggest[index].index += String.fromCharCode(binary.bytes.getUint8(binary.index, false));

						binary.index += 1;
					}
					const value_size = binary.bytes.getInt32(binary.index, false);

					binary.index += 4;

					for (let $index = 0; $index < value_size; $index++) {
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
export default (new Suggest());
