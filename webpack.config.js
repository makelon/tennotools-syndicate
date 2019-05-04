const path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

module.exports = env => ({
	mode: env && env.production ? 'production' : 'none',
	cache: false,
	context: path.resolve(__dirname, 'src'),
	entry: {
		app: ['../lib/jsutil/jsutil.js', './func.js'],
		style: './style.scss'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].[contenthash:8].js'
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
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
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
						name: '[name].[contenthash:8].[ext]'
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
			template: 'index.html',
			minify: {
				collapseWhitespace: true,
				collapseInlineTagWhitespace: true
			}
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash:8].css'
		})
	],
	devtool: env && env.production ? false : 'source-maps'
});
