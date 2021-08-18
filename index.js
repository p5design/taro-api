// 基于 http 与 urlConf 创建的 api 接口
import $http from "./utils/http";
import $request from "./utils/request";

// 放置 queryString 中
function setTokenInQueryString(options, tokenName, getToken) {
  if (getToken()) {
    let _queryString = {};
    _queryString[tokenName] = getToken();
    options.url = urlQuery(options.url, _queryString);
  }
}

// 放置 header 中
function setTokenInHeader(options, tokenName, getToken) {
  if (getToken()) {
    let _header = {};
    _header[tokenName] = getToken();
    options.header = Object.assign(options.header || {}, _header);
  }
}

// 处理返回结果
function handleRespData(respData) {
  if (!respData._err) {
    return Promise.resolve(respData);
  }
  // 错误返回如何处理
  else {
    showErrorMsg("网络错误", respData.msg);
    Promise.resolve(null);
  }
}

// 提示错误信息
function showErrorMsg(title, content, callback) {
  Taro.showModal({
    title,
    content,
    showCancel: false,
    success: function (res) {
      callback && callback();
    },
  });
}

/**
 * 创建接口基础配置信息
 *
 * @param {*} baseUrl
 * @param {*} tokenName
 * @param {*} getToken
 * @returns
 */
const createAPIBaseConf = (
  baseUrl = "",
  tokenName = "",
  getToken = () => {
    return "";
  }
) => {
  // 默认配置
  let defaultConf = {
    // 获取 URL 前缀接口
    getBaseUrl(url = "") {
      let BASE_URL = baseUrl;
      return BASE_URL;
    },
    // 显示/隐藏加载状态
    showLoading() {
      Taro.showNavigationBarLoading({});
    },
    hideLoading() {
      Taro.hideNavigationBarLoading({});
    },
    // 请求前置方法
    handleOptions(options) {
      setTokenInHeader(options, tokenName, getToken);
    },
    // 请求后置方法
    handleReturn(respData) {
      return handleRespData(respData);
    },
  };
  return defaultConf;
};

// 创建 API
const createAPI = (baseConf, urlConf) => {
  const api = {};
  // 遍历并初始化接口配置
  for (let [moduleName, moduleConf] of Object.entries(urlConf)) {
    api[moduleName] = {};
    let currModule = api[moduleName];
    for (let [nm, uc] of Object.entries(moduleConf)) {
      currModule[nm] = function (params, options = {}) {
        try {
          // 匹配接口前缀 开发环境则通过proxy配置转发请求； 生产环境根据实际配置
          options.baseURL = uc.baseURL || baseConf.getBaseUrl(uc.url);
          uc.baseURL = options.baseURL;
          uc.method = uc.method || "get";

          // 显示加载提示
          if (uc.showLoading) {
            baseConf.showLoading();
          }

          // 前置处理
          if (uc.before) {
            uc.before.call(this, options);
          }

          // 如果是自定义方法，直接调用
          if (typeof uc.method == "function") {
            // 因为不走axios, url需要拼接
            return uc.method.call(uc, params, options);
          }

          // 处理请求
          let handleFunction = $http[uc.method];
          const reqReturn = handleFunction(uc.url, params, options);

          // 隐藏加载提示
          if (uc.showLoading) {
            baseConf.hideLoading();
          }

          // 后置处理
          if (uc.after) {
            let curr = this;
            return reqReturn.then((respData) => {
              return uc.after.call(curr, respData);
            });
          } else {
            return reqReturn;
          }
        } catch (err) {
          console.log("## api-error ##\n%s", JSON.stringify(err));
        }
      };
    }
  }

  return api;
};

/**
 * 遍历模块接口，创建接口 URL 配置信息
 *
 * @param {*} modulePath 模块路径
 * @param {*} moduleFileSuffix 模块文件后缀
 * @returns
 */
const createAPIUrlConf = (
  modulePath = "./modules",
  moduleFileSuffix = "js"
) => {
  // 读取 module 信息
  let modulesFiles = require.context(
    modulePath,
    true,
    new RegExp("." + moduleFileSuffix + "$")
  );
  const modules = modulesFiles.keys().reduce((_modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
    const value = modulesFiles(modulePath);
    _modules[moduleName] = value.default;
    return _modules;
  }, {});

  // 整合成一个 urlConf
  // const urlConf = {};
  // for (let m in modules) {
  //   let moduleConf = modules[m];
  //   Object.assign(urlConf, moduleConf);
  // }
  // return urlConf;
  return modules;
};

let taroAPI = {
  createAPIUrlConf,
  createAPIBaseConf,
  createAPI,
  http: $http,
  request: $request,
};

module.exports = taroAPI;
module.exports.default = module.exports;
