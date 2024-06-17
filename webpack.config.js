import path from "path";
import url from "url";
export default {
  entry: "./src/index.js",
  output: {
    path: path.join(path.dirname(url.fileURLToPath(import.meta.url)), "dist"),
    filename: "bundle.js",
  },
  mode: "development",
};
