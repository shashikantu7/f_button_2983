const path = require('path');
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: './demo/main.js',
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
    modules: [
      path.join(__dirname, "src"),
      "node_modules"
    ]
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: false,
    port: 8001,
    publicPath: "/build/",
    open: true,
    openPage: "/demo/index.html",
    disableHostCheck: true
  }
};