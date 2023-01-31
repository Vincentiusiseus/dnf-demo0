const path = require("path")
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const project_root = path.join(__dirname, "../..")

module.exports = {
  mode: "development",
  target: "node",
  devtool: 'inline-source-map',
  entry: {
    main: path.join(project_root, "./features/main/index.ts")
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