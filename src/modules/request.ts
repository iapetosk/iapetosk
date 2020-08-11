import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";
export type RequestOptions = PartialOptions & {
	url: string,
	method: "GET" | "POST" | "PUT" | "DELETE";
};

export type PartialOptions = {
	headers?: { [key: string]: any; },
	encoding?: "binary" | "ascii" | "utf8" | "base64" | "hex";
};
class Request {
	public async send(options: RequestOptions, directory?: string) {
		return new Promise<{ response: http.IncomingMessage, body: string; }>((resolve, rejects) => {
			const SSL: boolean = options.url.startsWith("https");
			const URI: string[] = options.url.replace(/https?:\/\/(www.)?/, "").split(/\//);

			(SSL ? https : http).get({
				hostname: URI[0],
				path: ["", ...URI.slice(1)].join("/"),
				method: options.method,
				headers: options.headers,
				protocol: SSL ? "https:" : "http:"
			}, (response) => {
				if (options.encoding) {
					response.setEncoding(options.encoding);
				}
				if (directory) {
					// recursively renders directory
					fs.mkdirSync(path.dirname(directory), { recursive: true });
					// create filestream
					var file = fs.createWriteStream(directory);

					response.pipe(file);

					file.on("finish", () => {
						file.end();
						file.close();
						return resolve();
					});
					file.on("error", (error) => {
						fs.unlink(directory, () => {
							return rejects(error);
						});
					});
				} else {
					var body: string = "";

					response.on("data", (chunk) => {
						body += chunk;
					});
					response.on("end", () => {
						return resolve({
							response: response,
							body: body
						});
					});
					response.on("error", (error) => {
						return rejects(error);
					});
				}
			});
		});
	};
	public async get(url: string, options?: PartialOptions, directory?: string) {
		return this.send({ url: url, method: "GET", ...options || {} }, directory);
	}
	public async post(url: string, options?: PartialOptions, directory?: string) {
		return this.send({ url: url, method: "POST", ...options || {} }, directory);
	}
	public async put(url: string, options?: PartialOptions, directory?: string) {
		return this.send({ url: url, method: "PUT", ...options || {} }, directory);
	}
	public async delete(url: string, options?: PartialOptions, directory?: string) {
		return this.send({ url: url, method: "DELETE", ...options || {} }, directory);
	}
}
export default (new Request());
