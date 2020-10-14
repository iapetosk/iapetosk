const path = require("path");
const { dependencies } = require("../package");

function resolve_path() {
	return path.resolve(__dirname, "..", ...arguments);
}

module.exports = {
	target: "node-webkit",
	stats: "errors-only",
	entry: {
		renderer: resolve_path("src", "renderer", "index.tsx")
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
		filename: "bundle.js",
		path: resolve_path("build/system")
	},
	resolve: {
		alias: {
			"@": resolve_path("src")
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
						unsafe: true,
						drop_console: true
					}
				}
			})
		]
	},
	plugins: [
		new (require("html-webpack-plugin"))({
			filename: "index.html",
			template: resolve_path("src", "index.html")
		})
	]
};
