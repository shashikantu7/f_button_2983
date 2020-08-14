const path = require('path');
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: './demo/es6.js',
  output: {
    path: path.resolve(__dirname, 'demo/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'froala-editor': path.resolve(__dirname, 'dist')
    },
    modules: [
      path.join(__dirname, "dist"),
      "node_modules"
    ]
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: false,
    port: 8001,
    publicPath: "/build/",
    open: true,
    openPage: "/demo/es6.html",
    disableHostCheck: true
  }
};