const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    index: "./js/index.js"
  },
  output: {
    path: dist,
    filename: "[name].js"
  },
  devServer: {
    contentBase: dist,
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "static"),
        ignore: ["todo.txt"], // Exclude specific files if needed
      }
    ]),

    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ]
};
