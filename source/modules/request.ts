import * as fs from "fs";
import * as tls from "tls";
import * as path from "path";
import * as http from "http";
import * as https from "https";

import utility from "@/modules/utility";

import { File } from "@/modules/download";

export type RequestOptions = PartialOptions & PrivateOptions & {
	url: string,
	method: "GET" | "PUT" | "POST" | "DELETE";
};
export type PartialOptions = {
	agent?: boolean,
	headers?: Record<string, any>,
	encoding?: "binary" | "ascii" | "utf8" | "base64" | "hex",
	max_redirects?: number;
};
export type PrivateOptions = {
	redirects?: number;
};
export type RequestResponse = {
	encode: string,
	status: {
		code?: number,
		message?: string;
	},
	headers: Record<string, string | string[] | undefined>;
};
class Request {
	readonly agent: https.Agent = new https.Agent({});
	private max_redirects: number;
	constructor(max_redirects: number = 1) {
		// <define default properties>
		this.max_redirects = max_redirects;
		// @ts-ignore
		this.agent.createConnection = (options, callback): tls.TLSSocket => {
			return tls.connect({ ...options, servername: undefined }, callback);
		};
	}
	public async send(options: RequestOptions, file?: File): Promise<RequestResponse> {
		const I: Request = this;
		return new Promise<RequestResponse>((resolve, rejects) => {
			function recursive(options: RequestOptions, file?: File): void {
				// content
				const chunks: Buffer[] = [];
				// send request
				(I.SSL(options.url) ? https : http).request({
					agent: options.agent ? undefined : I.agent,
					method: options.method,
					headers: options.headers,
					protocol: I.SSL(options.url) ? "https:" : "http:",
					...I.parse(options.url)
				}, (response) => {
					// debug
					console.log(options);
					// redirects
					if ((options.max_redirects || I.max_redirects) > (options.redirects || 0)) {
						// clone original options
						const override: {
							changed: number,
							options: RequestOptions;
						} = {
							changed: 0,
							options: new Proxy({ ...options }, {
								set(target: RequestOptions, key: never, value: never): boolean {
									// is changed!
									override.changed++;
									// update property
									target[key] = value;
									// approve
									return true;
								}
							})
						};
						// new location
						if (response.headers.location) {
							override.options.url = response.headers.location || options.url;
						}
						// DDOS protection services
						if (response.headers.server) {
							switch (response.headers.server) {
								case "cloudflare": {
									override.options.headers = {
										"referer": options.url,
										"cookie": utility.cookie_encode({ "__cfduid": utility.cookie_decode([...(response.headers["set-cookie"] || []), ...([options.headers?.cookie] || [])].join(";\u0020"))["__cfduid"] })
									};
									break;
								}
							}
						}
						if (override.changed) {
							// subtract by one
							override.options.redirects = override.options.redirects ? override.options.redirects + 1 : 1;
							// return new instance
							return recursive({ ...override.options }, file);
						}
					}
					// encoding
					if (options.encoding) {
						response.setEncoding(options.encoding);
					}
					// file
					if (file) {
						// generates directory recursively
						fs.mkdirSync(path.dirname(file.path), { recursive: true });
						// content-length should be defined
						if (response.headers["content-length"]) {
							file.size = Number(response.headers["content-length"]);
						}
						var writable: fs.WriteStream = fs.createWriteStream(file.path);
					}
					response.on("data", (chunk) => {
						// content
						chunks.push(Buffer.from(chunk, "binary"));
						// file
						if (file) {
							file.written += chunk.length;
							writable.write(chunk);
						}
					});
					response.on("end", () => {
						// file
						if (file) {
							writable.end();
						}
						const buffer: Buffer = Buffer.concat(chunks);

						//debug
						console.log({
							encode: buffer.toString(options.encoding),
							status: {
								code: response.statusCode,
								message: response.statusMessage
							},
							headers: response.headers
						});
						return resolve({
							encode: buffer.toString(options.encoding),
							status: {
								code: response.statusCode,
								message: response.statusMessage
							},
							headers: response.headers
						});
					});
					response.on("error", (error) => {
						// print ERROR
						console.log(error);
						// rejects ERROR
						return rejects(error);
					});
				}).end();
			}
			return recursive(options, file);
		});
	};
	public async get(url: string, options: PartialOptions = {}, file?: File): Promise<RequestResponse> {
		return this.send({ url: url, method: "GET", ...options }, file);
	}
	public async put(url: string, options: PartialOptions = {}, file?: File): Promise<RequestResponse> {
		return this.send({ url: url, method: "PUT", ...options }, file);
	}
	public async post(url: string, options: PartialOptions = {}, file?: File): Promise<RequestResponse> {
		return this.send({ url: url, method: "POST", ...options }, file);
	}
	public async delete(url: string, options: PartialOptions = {}, file?: File): Promise<RequestResponse> {
		return this.send({ url: url, method: "DELETE", ...options }, file);
	}
	public parse(url: string): { host: string, path: string; } {
		const component: string[] = (url === decodeURI(url) ? encodeURI(url) : url).replace(/https?:\/\//, "").split(/\//);
		return {
			host: component[0],
			path: ["", ...component.slice(1)].join("/")
		};
	}
	public SSL(url: string): boolean {
		return /^https/.test(url);
	}
}
export default (new Request());
