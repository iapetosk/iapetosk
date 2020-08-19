const path = require("path");
const { dependencies } = require("../package");

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
	externals: [
		(context, request, callback) => {
			if (dependencies && dependencies[request]) {
				return callback(null, `commonjs ${request}`);
			} else {
				callback();
			}
		}
	],
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
		filename: "bundle.js",
		path: resolve_path("build")
	},
	resolve: {
		alias: {
			"@": resolve_path("src")
		},
		extensions: [".js", ".ts", ".vue", ".scss", ".json"]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new (require("terser-webpack-plugin"))({
				parallel: true,
				terserOptions: {
					output: {
						beautify: false,
						comments: false,
						semicolons: true
					},
					compress: {
						drop_console: true
					}
				}
			})
		]
	},
	plugins: [
		new (require("vue-loader/lib/plugin")),
		new (require("html-webpack-plugin"))({
			filename: "index.html",
			template: resolve_path("src", "index.html")
		})
	]
};
