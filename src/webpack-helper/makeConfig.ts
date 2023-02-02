import * as path from "path"
const ProgressBarPlugin = require("progress-bar-webpack-plugin");

import type { Configuration } from "webpack"

const PROJECT_ROOT = path.join(__dirname, "..")

export function makeConfig(dir_name:string) {
  return <Configuration> {
    mode: "development",
    target: "node",
    devtool: 'inline-source-map',
    entry: {
      main: path.join(dir_name, "index.ts")
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
            }
          ]
        },
      ]
    },
    node: {
      __dirname: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        "~": PROJECT_ROOT
      }
    },
    devServer: {
      static: {
        directory: path.resolve(dir_name, 'dist'),
      },
      devMiddleware: {
        publicPath: "/"
      },
      hot: true
    },
    output: {
      filename: '[name].js',
      path: path.resolve(dir_name, 'dist')
    },
    plugins: [
      new ProgressBarPlugin()
    ],
  }
}