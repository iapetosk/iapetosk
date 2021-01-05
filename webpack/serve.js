const webpack = require("webpack");
const { main, preload, renderer } = require("./webpack.config");

let reload = 0;

const compiled = {
	main: false,
	preload: false,
	renderer: false
};
const compiler_main = webpack({
	...main,
	mode: "development",
	watch: true,
	devtool: "eval-cheap-module-source-map"
}, () => {});
const compiler_preload = webpack({
	...preload,
	mode: "development",
	watch: true,
	devtool: "eval-cheap-module-source-map"
}, () => {});
const compiler_renderer = webpack({
	...renderer,
	mode: "development",
	watch: true,
	devtool: "eval-cheap-module-source-map"
}, () => {});
compiler_main.hooks.done.tap("done", () => {
	compiled.main = true;
	start();
});
compiler_preload.hooks.done.tap("done", () => {
	compiled.preload = true;
	start();
});
compiler_renderer.hooks.done.tap("done", () => {
	compiled.renderer = true;
	start();
});
function start() {
	if (!reload && compiled.main && compiled.preload && compiled.renderer) {
		const electron = require("child_process").spawn("npx.cmd", ["electron", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
		electron.on("close", () => {
			return process.exit();
		});
		reload++;
	}
}
