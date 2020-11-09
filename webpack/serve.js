process.env.NODE_ENV = "development";

const webpack = require("webpack");
const webpack_config = require("./webpack.config");
const webpack_development_server = require("webpack-dev-server");

const compiler = webpack({
	...webpack_config,
	devtool: "eval-cheap-module-source-map",
	mode: process.env.NODE_ENV,
	plugins: [
		...webpack_config.plugins,
		new webpack.HotModuleReplacementPlugin()
	]
});

var times = 0;

compiler.hooks.done.tap("done", () => {
	if (!times) {
		const NWJS = require("child_process").spawn("npx.cmd", ["nw", "."], { args: ["--colors"], stdio: [process.stdin, process.stdout, "pipe"] });
		NWJS.on("close", () => {
			compiler.close(() => {
				process.exit();
			});
		});
	}
	times++;
	require("../source/modules/listener").default.emit("reload");
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
		compress: true,
		disableHostCheck: true
	}
).listen(8080, "localhost");
