import * as fs from "fs";
import * as tls from "tls";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import { File } from "@/modules/download";
export type RequestOptions = PartialOptions & {
	url: string,
	method: "GET" | "POST" | "PUT" | "DELETE";
};
export type PartialOptions = {
	headers?: { [key: string]: any; },
	encoding?: "binary" | "ascii" | "utf8" | "base64" | "hex";
};
class Request {
	public async send(options: RequestOptions, file?: File) {
		const $: Buffer[] = [];
		const SSL: boolean = options.url.startsWith("https");
		const URI: string[] = options.url.replace(/https?:\/\/(www.)?/, "").split("/");
		return new Promise<{ content: { buffer: Buffer, encode: string; }, status: { code?: number, message?: string; }; }>((resolve, rejects) => {
			(SSL ? https : http).get({
				hostname: URI[0],
				path: ["", ...URI.slice(1)].join("/"),
				method: options.method,
				headers: options.headers,
				protocol: SSL ? "https:" : "http:",
				rejectUnauthorized: false
			}, (response) => {
				// redirects
				if (response.headers.location) {
					return this.send({ ...options, url: response.headers.location }, file);
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
						file.size = parseInt(response.headers["content-length"]);
					}
					var writable: fs.WriteStream = fs.createWriteStream(file.path);
				}
				response.on("data", (chunk) => {
					$.push(Buffer.from(chunk, "binary"));
					// file
					if (file) {
						file.written += chunk.length;
						// stream
						writable.write(chunk);
					}
				});
				response.on("end", () => {
					// file
					if (file) {
						writable.end();
					}
					return resolve({
						content: {
							buffer: Buffer.concat($),
							encode: Buffer.concat($).toString(options.encoding)
						},
						status: {
							code: response.statusCode,
							message: response.statusMessage
						}
					});
				});
				response.on("error", (error) => {
					return rejects(error);
				});
			});
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
}
export default (new Request());
