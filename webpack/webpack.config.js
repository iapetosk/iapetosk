const path = require("path");
const vue_loader_plugin = require("vue-loader/lib/plugin");
const html_webpack_plugin = require("html-webpack-plugin");

function resolve_path() {
	return path.resolve(__dirname, "..", ...arguments);
}

module.exports = {
	devtool: "cheap-module-eval-source-map",
	target: "node-webkit",
	stats: "errors-only",
	entry: {
		renderer: resolve_path("src", "renderer", "index.ts")
	},
	module: {
		rules: [
			{
				test: /\.(ts)$/,
				loader: "ts-loader"
			},
			{
				test: /\.(vue)$/,
				loader: "vue-loader"
			},
			{
				test: /\.(scss)$/,
				loader: ["style-loader", "css-loader", "sass-loader"]
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				loader: "file-loader"
			}
		]
	},
	output: {
		filename: "[name].bundle.js",
		path: resolve_path("dist")
	},
	resolve: {
		alias: {
			"@": resolve_path("src")
		},
		extensions: [".js", ".ts", ".vue", ".scss", ".json"]
	},
	plugins: [
		new vue_loader_plugin(),
		new html_webpack_plugin({
			filename: "index.html",
			template: resolve_path("src", "index.html")
		})
	]
};
