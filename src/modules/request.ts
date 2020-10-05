import * as fs from "fs";
import * as tls from "tls";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import utility from "./utility";
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
		/*
		this.get("https://wecloudimage.net/comics/jdrive01/202008/%EC%B8%A0%EB%AC%B4%EC%A7%80%EB%A7%88%EA%B0%80%EB%A6%AC%C3%97%EC%8A%A4%ED%94%84%EB%A7%81/%EC%B8%A0%EB%AC%B4%EC%A7%80%EB%A7%88%EA%B0%80%EB%A6%AC%C3%97%EC%8A%A4%ED%94%84%EB%A7%81%201%ED%99%94/ec2536f7-675b-41df-8645-cb0cedbfe1e8.jpg", { agent: true, max_redirects: 10 }).then((callback) => {
			console.log(callback);
		});
		*/
	}
	public async send(options: RequestOptions, file?: File) {
		const SSL: boolean = options.url.startsWith("https");
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
				if ((options.max_redirects || 1) > (options.redirects || 0) && (response.headers.location || response.headers["set-cookie"])) {
					// subtract by one
					options.redirects = options.redirects ? options.redirects + 1 : 1;
					// return new instance
					return this.send({ ...options, url: response.headers.location || options.url, headers: { ...options.headers, cookie: response.headers["set-cookie"]?.join(";\u0020") } }, file);
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
