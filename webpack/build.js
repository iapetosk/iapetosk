const fs = require("fs");
const webpack = require("webpack");
const package = require("../package");
const builder = require("electron-builder");
const { main, renderer } = require("./webpack.config");

const compiler_main = webpack({
	...main,
	mode: "production",
	devtool: "inline-nosources-cheap-module-source-map",
}, () => {
	compiler_main.close(() => {
		const compiler_renderer = webpack({
			...renderer,
			mode: "production",
			devtool: "inline-nosources-cheap-module-source-map",
		}, () => {
			compiler_renderer.close(() => {
				fs.writeFile("./build/package.json", JSON.stringify({ name: package.name, main: package.main, version: package.version, description: package.description }), {}, () => {
					builder.build({
						targets: builder.Platform.WINDOWS.createTarget("portable"),
						config: {
							artifactName: "waifu-material.exe",
							appId: "org.sombian.waifu.material",
							files: [
								"build/*.js",
								"build/*.json",
								"build/*.html",
							],
							directories: {
								output: "releases"
							},
							portable: {
								unpackDirName: "waifu-material"
							},
							icon: "../source/assets/icons/icon.ico",
						}
					});
				});
			});
		});
	});
});
