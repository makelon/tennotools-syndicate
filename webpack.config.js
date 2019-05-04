const path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

module.exports = env => {
	const isProd = env && env.production,
		filenamePattern = isProd ? '[name].[contenthash:8]' : '[name]';

	return {
		mode: isProd ? 'production' : 'none',
		cache: false,
		context: path.resolve(__dirname, 'app'),
		entry: {
			app: ['./lib/jsutil/jsutil.js', './src/func.js'],
			style: './css/style.scss'
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: `${filenamePattern}.js`
		},
		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								sourceMap: !isProd
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: !isProd,
								implementation: require("sass")
							}
						}
					]
				},
				{
					test: /\.png$/,
					use: {
						loader: 'file-loader',
						options: {
							name: `${filenamePattern}.[ext]`
						}
					}
				}
			]
		},
		plugins: [
			new FixStyleOnlyEntriesPlugin(),
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				filename: 'index.html',
				template: './src/index.html',
				minify: {
					collapseWhitespace: true,
					collapseInlineTagWhitespace: true
				}
			}),
			new MiniCssExtractPlugin({
				filename: `${filenamePattern}.css`
			})
		],
		devtool: isProd ? false : 'source-maps'
	};
}
