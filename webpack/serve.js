const webpack = require("webpack");
const { main, renderer } = require("./webpack.config");
const webpack_development_server = require("webpack-dev-server");

let count = 0;

const compiler_main = webpack({
	...main,
	mode: "development",
	devtool: "eval-cheap-module-source-map"
}, () => {
	const compiler_renderer = webpack({
		...renderer,
		mode: "development",
		devtool: "eval-cheap-module-source-map"
	}, () => { });
	compiler_renderer.hooks.done.tap("done", () => {
		if (!count) {
			const electron = require("child_process").spawn("npx.cmd", ["electron", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
			electron.on("close", () => {
				compiler_main.close(() => {
					compiler_renderer.close(() => {
						process.exit();
					});
				});
			});
		}
		count++;
	});
	new webpack_development_server(compiler_renderer,
		{
			stats: {
				all: false,
				assets: true,
				chunks: true,
				errors: true,
				colors: true
			},
			hot: true,
			quiet: true,
			inline: true,
			compress: true
		}
	).listen(8080, "localhost", () => { });
});
