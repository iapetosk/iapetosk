process.env.NODE_ENV = "production";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const package = require("../package");
const webpack_config = require("./webpack.config");

async function request(hostname, path) {
	const chunks = [];
	return new Promise((resolve, rejects) => {
		require("https").get({
			hostname: hostname,
			path: path,
			method: "GET",
			protocol: "https:"
		}, (response) => {
			response.on("data", (chunk) => {
				chunks.push(Buffer.from(chunk, "binary"));
			});
			response.on("end", () => {
				return resolve(Buffer.concat(chunks));
			});
		});
	});
}
/*
{
	archive: {
		flavor: 0,
		version: 0,
		platform: 0,
		architecture: 0,
	},
	output: {
		path: 0,
		name: 0,
		icon: 0
	}
}
*/
async function build(options) {
	return new Promise((resolve, rejects) => {
		request("dl.nwjs.io", `/${options.archive.version}/${options.archive.flavor}-${options.archive.version}-${options.archive.platform}-${options.archive.architecture}.zip`).then((callback) => {
			// write archive
			fs.writeFile(path.resolve(options.output.path, "archive.zip"), callback, {}, () => {
				// write package.json
				fs.writeFile(path.resolve(options.output.path, "package.json"), JSON.stringify({
					name: "blossom",
					main: "index.html",
					window: package.window
				}), () => {
					// node-stream-zip
					const archive = new (require("node-stream-zip"))({ file: path.resolve(options.output.path, "archive.zip") });
					archive.on("ready", () => {
						archive.extract(`nwjs-${options.archive.version}-${options.archive.platform}-${options.archive.architecture}/`, options.output.path, (error, count) => {
							// close archive
							archive.close();
							// remove archive
							fs.unlink(path.resolve(options.output.path, "archive.zip"), () => {
								// nw.exe update
								require("rcedit")(path.resolve(options.output.path, "nw.exe"), {
									"product-version": package.version,
									"file-version": package.version,
									"version-string": {
										"ProductName": package.name,
										"CompanyName": package.author,
										"FileDescription": package.description,
										"LegalCopyright": `Copyright (c) ${new Date().getFullYear()} ${package.author}`,
									},
									"icon": options.output.icon
								}).then(() => {
									fs.rename(path.resolve(options.output.path, "nw.exe"), path.resolve(options.output.path, options.output.name), () => {
										return resolve();
									});
								});
							});
						});
					});
				});
			});
		});
	});
}

webpack({
	...webpack_config,
	mode: process.env.NODE_ENV
}, async (error, stats) => {
	const version = await request("nwjs.io", "/versions.json").then((callback) => {
		return JSON.parse(callback.toString())["stable"];
	});
	Promise.all([build({
		archive: {
			flavor: "nwjs",
			version: version,
			platform: "win",
			architecture: "x64",
		},
		output: {
			path: "build/",
			name: "blossom.exe",
			icon: "src/assets/icons/icon.ico"
		}
	})]);
});
