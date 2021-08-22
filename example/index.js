import { createAPI } from "taro-api";
import baseConf from "./conf";

// 1. 创建 url 配置
// 使用了 webpack 中 require.context 来自动导入 modules 目录下的模块文件
const urlConf = (function () {
  const modulesFiles = require.context("./modules", true, /\.js$/);
  const modules = modulesFiles.keys().reduce((_modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
    const value = modulesFiles(modulePath);
    _modules[moduleName] = value.default;
    return _modules;
  }, {});
  return modules;
})();

// 2. 创建API
const api = createAPI(baseConf, urlConf);

// 3. 默认返回
export default api;
