process.env.NODE_ENV = "production";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const package = require("../package");
const webpack_config = require("./webpack.config");

request("nwjs.io", "/versions.json").then((callback) => {
	const options = {
		archive: {
			flavor: "nwjs",
			version: JSON.parse(callback.toString())["stable"],
			platform: "win",
			architecture: "x64",
		},
		output: {
			path: "build/",
			name: "blossom.exe",
			icon: "src/assets/icons/icon.ico"
		}
	};
	fs.rmdirSync(options.output.path, { recursive: true });
	// bundle webpack
	webpack({
		...webpack_config,
		mode: process.env.NODE_ENV
	}, async (error, stats) => {
		Promise.all([build(options)]);
	});
});
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
async function build(options) {
	return new Promise((resolve, rejects) => {
		request("dl.nwjs.io", `/${options.archive.version}/${options.archive.flavor}-${options.archive.version}-${options.archive.platform}-${options.archive.architecture}.zip`).then((callback) => {
			// write archive
			fs.writeFileSync(path.resolve(options.output.path, "archive.zip"), callback);
			// write package.json
			fs.writeFileSync(path.resolve(options.output.path, "package.json"), JSON.stringify({
				name: "blossom",
				main: "index.html",
				window: package.window
			}));
			// extract archive
			const archive = new (require("node-stream-zip"))({ file: path.resolve(options.output.path, "archive.zip") });
			archive.on("ready", () => {
				archive.extract(`nwjs-${options.archive.version}-${options.archive.platform}-${options.archive.architecture}/`, options.output.path, (error, count) => {
					// close archive
					archive.close();
					// remove archive
					fs.unlinkSync(path.resolve(options.output.path, "archive.zip"));
					// rename executable
					fs.renameSync(path.resolve(options.output.path, "nw.exe"), path.resolve(options.output.path, options.output.name));
					// update executable
					require("rcedit")(path.resolve(options.output.path, options.output.name), {
						"product-version": package.version,
						"version-string": {
							"ProductName": package.name,
							"CompanyName": package.author,
							"FileDescription": package.description,
							"LegalCopyright": `Copyright (c) ${new Date().getFullYear()} ${package.author}`,
						},
						"icon": options.output.icon
					}).then(() => {
						return resolve();
					});
				});
			});
		});
	});
}
