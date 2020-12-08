const webpack = require("webpack");
const { renderer } = require("./webpack.config");
const webpack_development_server = require("webpack-dev-server");

const compiler = webpack({
	...renderer,
	mode: "development",
	devtool: "eval-cheap-module-source-map"
}, () => {});

let count = 0;

compiler.hooks.done.tap("done", () => {
	if (!count) {
		const electron = require("child_process").spawn("npx.cmd", ["electron", "./build/main.js"], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
		electron.on("close", () => {
			compiler.close(() => {
				process.exit();
			});
		});
	}
	count++;
});

new webpack_development_server(compiler,
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
).listen(8080, "localhost", () => {});
