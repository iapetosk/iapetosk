import * as node_tls from "tls";
import * as node_http from "http";
import * as node_https from "https";

import settings from "@/modules/settings";

export type RequestOptions = {
	request: {
		url: string,
		method: RequestMethods,
		charset: BufferEncoding;
	},
	partial: PartialOptions,
	private: PrivateOptions;
};
export type PartialOptions = {
	agent?: boolean,
	headers?: Record<string, string>,
	max_redirects?: number;
};
export type PrivateOptions = {
	redirects?: number;
};
export type RequestMethods = "GET" | "PUT" | "POST" | "DELETE";
export enum RequestProgress {
	TOTAL_SIZE,
	PER_SECOND,
	REMAINING,
	RECEIVED,
	PROGRESS
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
	readonly http_agent = new node_http.Agent({});
	readonly https_agent = new node_https.Agent({});
	constructor() {
		for (const protocol of ["http", "https"]) {
			// @ts-ignore
			this[protocol + "_agent"].createConnection = (options, callback): tls.TLSSocket => {
				return node_tls.connect({ ...options, servername: undefined }, callback);
			};
		}
	}
	private send(options: RequestOptions, callback?: (chunk: any, progress: Record<RequestProgress, number>) => void) {
		const I = this;
		return new Promise<RequestResponse>((resolve, reject) => {
			function recursive(options: RequestOptions) {
				const chunks: Buffer[] = [];

				(I.isHTTPS(options.request.url) ? node_https : node_http).request({
					method: options.request.method,
					headers: options.partial.headers,
					protocol: I.isHTTPS(options.request.url) ? "https:" : "http:",
					...I.parseURL(options.request.url)
				}, (response) => {
					// redirect
					if ((options.partial.max_redirects || settings.request.max_redirects) > (options.private.redirects || 0) && response.headers["location"]) {
						return recursive({ ...options, private: { ...options.private, redirects: options.private.redirects ? options.private.redirects + 1 : 1 } });
					}
					if (callback) {
						var L = Number(response.headers["content-length"]), R = 0, T = Date.now();
					}
					response.on("data", (chunk) => {
						if (callback) {
							// increase R
							R += chunk.toString(options.request.charset).length;
							// callback
							callback(chunk,
								{
									[RequestProgress.TOTAL_SIZE]: L,
									[RequestProgress.PER_SECOND]: R / (Date.now() - T) / 1000,
									[RequestProgress.REMAINING]: L - R,
									[RequestProgress.RECEIVED]: R,
									[RequestProgress.PROGRESS]: R / L
								}
							);
						}
						chunks.push(chunk);
					});
					response.once("end", () => {
						return resolve({
							encode: Buffer.concat(chunks).toString(options.request.charset),
							status: {
								code: response.statusCode,
								message: response.statusMessage
							},
							headers: response.headers
						});
					});
					response.once("close", () => {
						return reject(false);
					});
					response.once("error", (error) => {
						return reject(error);
					});
				}).end();
			}
			return recursive(options);
		});
	}
	private parseURL(url: string) {
		const fragment: string[] = (url === decodeURI(url) ? encodeURI(url) : url).replace(/https?:\/\//, "").split(/\//);
		return {
			host: fragment[0],
			path: ["", ...fragment.slice(1)].join("/")
		};
	}
	private isHTTPS(url: string) {
		return /^https/.test(url);
	}
	public GET(url: string, options: PartialOptions = {}, charset: BufferEncoding = "utf-8", callback?: (chunk: any, progress: Record<RequestProgress, number>) => void) {
		return this.send({ request: { url: url, method: "GET", charset: charset }, partial: { ...options }, private: {} }, callback);
	}
	public PUT(url: string, options: PartialOptions = {}, charset: BufferEncoding = "utf-8", callback?: (chunk: any, progress: Record<RequestProgress, number>) => void) {
		return this.send({ request: { url: url, method: "PUT", charset: charset }, partial: { ...options }, private: {} }, callback);
	}
	public POST(url: string, options: PartialOptions = {}, charset: BufferEncoding = "utf-8", callback?: (chunk: any, progress: Record<RequestProgress, number>) => void) {
		return this.send({ request: { url: url, method: "POST", charset: charset }, partial: { ...options }, private: {} }, callback);
	}
	public DELETE(url: string, options: PartialOptions = {}, charset: BufferEncoding = "utf-8", callback?: (chunk: any, progress: Record<RequestProgress, number>) => void) {
		return this.send({ request: { url: url, method: "DELETE", charset: charset }, partial: { ...options }, private: {} }, callback);
	}
}
export default (new Request());
