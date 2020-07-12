process.env.NODE_ENV = "production";

const webpack = require("webpack");
const webpack_config = require("./webpack.config");

const compiler = webpack({
	...webpack_config,
	mode: process.env.NODE_ENV
}, (error, stats) => {
	console.log(stats.toString({ chunks: false, colors: true }));
});

if (!times) {
	const child = require("child_process").spawn("npx.cmd", ["nwbuild", "--platforms", "win32,win64,osx64,linux32,linux64", "--buildDir", "./dist/", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
	// increase count
	times++;
	child.on("close", () => {
		process.exit();
	});
}
