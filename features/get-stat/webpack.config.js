const path = require("path")
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const project_root = path.join(__dirname, "../..")

module.exports = {
  mode: "development",
  target: "node",
  devtool: 'inline-source-map',

  /**
   * 2021-10-26 08:23
   * Page entry files added in server's code.
   */
  entry: {
    main: path.join(project_root, "./features/get-stat/index.ts")
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
    __dirname: false
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      "~": project_root
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