import TaroApi from "taro-api";

// 放置 queryString 中
// import { urlQuery } from "./utils/common";
// function setTokenInQueryString(options, tokenName, getToken) {
//   if (getToken()) {
//     let _queryString = {};
//     _queryString[tokenName] = getToken();
//     options.url = urlQuery(options.url, _queryString);
//   }
// }

// 放置 header 中
// function setTokenInHeader(options, tokenName, getToken) {
//   if (getToken()) {
//     let _header = {};
//     _header[tokenName] = getToken();
//     options.header = Object.assign(options.header || {}, _header);
//   }
// }

/**
 * 读取目录 modules 中的配置文件
 * @returns
 */
const createAPIUrlConf = () => {
  // 读取 modules 下 js 文件
  const modulesFiles = require.context("./modules", true, /\.js$/);
  const modules = modulesFiles.keys().reduce((_modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
    const value = modulesFiles(modulePath);
    _modules[moduleName] = value.default;
    return _modules;
  }, {});
  return modules;
};

//
