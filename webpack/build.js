process.env.NODE_ENV = "production";

const webpack = require("webpack");
const webpack_config = require("./webpack.config");

webpack({
	...webpack_config,
	mode: process.env.NODE_ENV
}, (error, stats) => {
	require("child_process").spawn("npx.cmd", ["build", "--tasks", "win-x64", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
});
