const path = require("path");

function resolve_path() {
	return path.resolve(__dirname, "..", ...arguments);
}

const boilerplate = {
	stats: "errors-only",
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use: [{ loader: "ts-loader" }]
			},
			{
				test: /\.(scss)$/,
				use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }]
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [{ loader: "file-loader" }]
			}
		]
	},
	output: {
		path: resolve_path("build")
	},
	resolve: {
		alias: {
			"@": resolve_path("source")
		},
		extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".json"]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new (require("terser-webpack-plugin"))({
				parallel: true,
				terserOptions: {
					output: {
						ecma: 2020,
						comments: false
					},
					compress: {
						ecma: 2020,
						drop_console: true
					}
				}
			})
		]
	},
	plugins: []
};
const main = {
	...boilerplate,
	target: "electron-main",
	entry: resolve_path("electron", "main.ts"),
	output: {
		...boilerplate.output,
		filename: "main.js"
	}
};
const renderer = {
	...boilerplate,
	target: "electron-renderer",
	entry: resolve_path("electron", "renderer.tsx"),
	output: {
		...boilerplate.output,
		filename: "renderer.js"
	},
	plugins: [
		new (require("html-webpack-plugin"))({
			filename: "index.html",
			template: resolve_path("electron", "index.html")
		})
	]
};
module.exports = {
	main: main,
	renderer: renderer
};
