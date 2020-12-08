const webpack = require("webpack");
const { main } = require("./webpack.config");

const compiler = webpack({
	...main,
	mode: "development",
	devtool: "eval-cheap-module-source-map"
}, () => {});
