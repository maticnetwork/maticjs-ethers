/* global __dirname, require, module */
const path = require('path')
const webpack = require('webpack')
const env = require('yargs').argv.env // use --env with webpack 2
const copyPlugin = require('copy-webpack-plugin')

const libraryName = 'matic-ethers'

let mode = 'development'

if (env === 'build') {
  mode = 'production'
}

const clientConfig = {
  mode,
  devtool: 'source-map',
  entry: `${__dirname}/src/index.ts`,
  target: 'web',
  output: {
    path: `${__dirname}/dist`,
    filename: `${libraryName}.umd${mode === 'production' ? '.min' : ''}.js`,
    library: libraryName,
    libraryTarget: 'umd',
    // libraryExport: 'default',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    ethers: 'ethers',
    '@maticnetwork/maticjs': '@maticnetwork/maticjs',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.json', '.js', '.ts', '.tsx']
  },
  plugins: [
    new copyPlugin({
      patterns: [{ from: path.resolve('build_helper', 'npm.export.js'), to: '' }],
    })
  ],
}

const serverConfig = {
  ...clientConfig,
  target: 'node',
  output: {
    path: `${__dirname}/dist`,
    filename: `${libraryName}.node${mode === 'production' ? '.min' : ''}.js`,
    // globalObject: 'this',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify("node")
    }),
  ]
}

const standaloneConfig = {
  ...clientConfig,
  output: {
    ...clientConfig.output,
    library: 'matic-ethers',
    filename: `${libraryName}.js`,
  },
  externals: {},
}

module.exports = [clientConfig, serverConfig, standaloneConfig]
