const path = require('path');
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: './demo/commonjs.ts',
  output: {
    path: path.resolve(__dirname, 'demo/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader?configFile=commonjs.tsconfig.json',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      'froala-editor': path.resolve(__dirname, 'dist')
    }
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: false,
    port: 8001,
    publicPath: "/build/",
    open: true,
    openPage: "/demo/commonjs.html",
    disableHostCheck: true
  }
};