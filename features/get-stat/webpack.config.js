const path = require("path")
const ProgressBarPlugin = require("progress-bar-webpack-plugin");

module.exports = {
  mode: "development",
  target: "node",
  devtool: 'inline-source-map',

  /**
   * 2021-10-26 08:23
   * Page entry files added in server's code.
   */
  entry: {
    main: "./features/get-stat/index.ts"
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
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      "~": __dirname
    }
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    devMiddleware: {
      publicPath: "/"
    },
    hot: true
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new ProgressBarPlugin()
  ],
}