export default {
  "entry": "src/index.ts",
  "env": {
    "development": {
      // 没启用 babel 故这个也没有起作用
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime",
        ["import", { "libraryName": "antd", "libraryDirectory": "lib", "style": true }]
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime"
      ]
    }
  }
}
