import * as fs from "fs";
import * as tls from "tls";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import utility from "@/modules/utility";
import { File } from "@/modules/download";

export type RequestOptions = PartialOptions & PrivateOptions & {
	url: string,
	method: "GET" | "POST" | "PUT" | "DELETE";
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
class Request {
	readonly agent: https.Agent = new https.Agent({});
	constructor() {
		// @ts-ignore
		this.agent.createConnection = (options, callback): tls.TLSSocket => {
			return tls.connect({ ...options, servername: undefined }, callback);
		};
	}
	public async send(options: RequestOptions, file?: File) {
		const SSL: boolean = /^https/.test(options.url);
		const chunks: Buffer[] = [];
		return new Promise<{ content: { buffer: Buffer, encode: string; }, status: { code?: number, message?: string; }; }>((resolve, rejects) => {
			(SSL ? https : http).request({
				agent: options.agent ? undefined : this.agent,
				method: options.method,
				headers: options.headers,
				protocol: SSL ? "https:" : "http:",
				...this.parse(options.url)
			}, (response) => {
				// redirects
				if ((options.max_redirects || 1) > (options.redirects || 0)) {
					// clone original options
					const override: {
						changed: boolean,
						options: RequestOptions;
					} = {
						changed: false,
						options: new Proxy({ ...options }, {
							set(target: RequestOptions, key: never, value: never): boolean {
								// is changed!
								override.changed = true;
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
						return this.send(override.options, file);
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

					return resolve({
						content: {
							buffer: buffer,
							encode: buffer.toString(options.encoding)
						},
						status: {
							code: response.statusCode,
							message: response.statusMessage
						}
					});
				});
				response.on("error", (error) => {
					// print ERROR
					console.log(error);
					// rejects ERROR
					return rejects(error);
				});
			}).end();
		});
	};
	public async get(url: string, options: PartialOptions = {}, file?: File) {
		return this.send({ url: url, method: "GET", ...options }, file);
	}
	public async post(url: string, options: PartialOptions = {}, file?: File) {
		return this.send({ url: url, method: "POST", ...options }, file);
	}
	public async put(url: string, options: PartialOptions = {}, file?: File) {
		return this.send({ url: url, method: "PUT", ...options }, file);
	}
	public async delete(url: string, options: PartialOptions = {}, file?: File) {
		return this.send({ url: url, method: "DELETE", ...options }, file);
	}
	public parse(url: string): { host: string, path: string; } {
		const component: string[] = (url === decodeURI(url) ? encodeURI(url) : url).replace(/https?:\/\//, "").split(/\//);
		return {
			host: component[0],
			path: ["", ...component.slice(1)].join("/")
		};
	}
}
export default (new Request());
