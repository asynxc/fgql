var webpack = require('webpack')
var Copy = require('copy-webpack-plugin')
var path = require('path')
var env = require('yargs').argv.mode

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var libraryName = 'fgql'
var outputFile = libraryName + '.js'
var plugins = []

if (env === 'build') {
	plugins.push(new UglifyJsPlugin({ minimize: true }))
	outputFile = libraryName + '.min.js'
}

plugins.push(new webpack.DefinePlugin({
	'process.env': {
		'NODE_ENV': env === 'build' ? '"production"' : "'development'"
	},
	'FUNCTION': '"function"',
	'STRING': '"string"',
	'BOOLEAN': '"boolean"',
	'NUMBER': '"number"',
	'ARRAY': '"array"',
	'OBJECT': '"object"'
}))

plugins.push(new webpack.optimize.OccurenceOrderPlugin())

const externals = {
	react: {
		root: 'react',
		commonjs2: 'react',
		commonjs: 'react',
		amd: 'react'
	}
}


var config = {
	externals: externals,
	entry: path.join(__dirname, '/src/index.js'),
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, '/lib'),
		filename: outputFile,
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [
			{
				test: /(\.jsx|\.js)$/,
				loader: 'babel?cacheDirectory',
				exclude: /(node_modules)/
			},
			{
				test: /(\.jsx|\.js)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/
			},
			{
				test: /\.json$/,
				loader: 'json'
			}
		]
	},
	resolve: {
		root: path.resolve('./src'),
		extensions: ['', '.js']
	},
	plugins: plugins
}

module.exports = config
