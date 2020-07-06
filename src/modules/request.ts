import * as fs from "fs";
import * as http from "http";
import * as https from "https";

export type RequestOptions = {
	url?: string,
	method?: "GET" | "POST" | "PUT" | "DELETE";
	headers?: { [key: string]: any; },
	encoding?: "binary" | "ascii" | "utf8" | "base64" | "hex",
};

class Request {
	public async adapt(options: RequestOptions, directory?: string) {
		return new Promise<{ response: http.IncomingMessage, body: string }>((resolve, rejects) => {
			const SSL: boolean = options.url!.startsWith("https");
			const URI: string[] = options.url!.replace(/https?:\/\/(www.)?/, "").split(/\//);

			(SSL ? https : http).get({
				hostname: URI[0],
				path: URI.join("/").replace(new RegExp(`^${URI[0]}`), ""),
				method: options.method,
				headers: options.headers,
				protocol: SSL ? "https:" : "http:"
			}, (response) => {
				if (options.encoding) {
					response.setEncoding(options.encoding);
				}
				if (directory) {
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
	public async get(url: string, options?: RequestOptions) {
		return this.adapt({ url: url, method: "GET", ...options || {} });
	}
	public async post(url: string, options?: RequestOptions) {
		return this.adapt({ url: url, method: "POST", ...options || {} });
	}
	public async put(url: string, options?: RequestOptions) {
		return this.adapt({ url: url, method: "PUT", ...options || {} });
	}
	public async delete(url: string, options?: RequestOptions) {
		return this.adapt({ url: url, method: "DELETE", ...options || {} });
	}
}

export default (new Request());
