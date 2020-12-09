const webpack = require("webpack");
const { main, renderer } = require("./webpack.config");

let reload = 0;

const compiler_main = webpack({
	...main,
	mode: "development",
	watch: true,
	devtool: "eval-cheap-module-source-map"
}, () => {
	const compiler_renderer = webpack({
		...renderer,
		mode: "development",
		watch: true,
		devtool: "eval-cheap-module-source-map"
	}, () => { });
	compiler_renderer.hooks.done.tap("done", () => {
		if (!reload) {
			const electron = require("child_process").spawn("npx.cmd", ["electron", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
			electron.on("close", () => {
				return process.exit();
			});
		}
		reload++;
	});
});
