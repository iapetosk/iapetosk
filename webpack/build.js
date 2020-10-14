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
			name: `${package.name}.exe`,
			icon: {
				file: "src/assets/icons/icon.ico",
				task: "src/assets/icons/icon.png"
			}
		}
	};
	fs.rmdirSync(options.output.path, { recursive: true });
	// bundle webpack
	const compiler = webpack({
		...webpack_config,
		devtool: "hidden-source-map",
		mode: process.env.NODE_ENV
	}, async (error, stats) => {
		compiler.close(() => {
			Promise.all([build(options)]);
		});
	});
});
async function request(host, path) {
	const chunks = [];
	return new Promise((resolve, rejects) => {
		require("https").get({
			host: host,
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
			// write files
			for (const file of [
				{
					name: "archive.zip",
					data: callback
				},
				{
					name: "package.json",
					data: JSON.stringify({ name: package.name, main: "system/index.html", window: { ...package.window, icon: "system/icon.png" }})
				},
				{
					name: "system/icon.png",
					data: fs.readFileSync(options.output.icon.task)
				}
			]) {
				fs.writeFileSync(path.resolve(options.output.path, file.name), file.data);
			}
			// extract archive
			const archive = new (require("node-stream-zip"))({ file: path.resolve(options.output.path, "archive.zip") });
			archive.on("ready", () => {
				archive.extract(`nwjs-${options.archive.version}-${options.archive.platform}-${options.archive.architecture}/`, options.output.path, (error, count) => {
					// close archive
					archive.close();
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
						"icon": options.output.icon.file
					}).then(() => {
						// remove unnecessary files
						for (const file of ["archive.zip", "notification_helper.exe", "credits.html"]) {
							fs.unlinkSync(path.resolve(options.output.path, file));
						}
						// <END>
						return resolve();
					});
				});
			});
		});
	});
}
