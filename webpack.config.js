import path, { resolve } from "path";
import url from "url";
export default {
  entry: "./src/index.tsx",
  output: {
    path: path.join(path.dirname(url.fileURLToPath(import.meta.url)), "dist"),
    filename: "bundle.js",
  },
  mode: "development",
  resolve: {
    extensions: [".ts", ".js", ".json", ".tsx", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(?:jsx|tsx|js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-typescript",
                { targets: "defaults", development: true },
              ],
              [
                "@babel/preset-react",
                { targets: "defaults", development: true },
              ],
            ],
          },
        },
      },
    ],
  },
};
