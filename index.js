// 基于 http 与 urlConf 创建的 api 接口
import http from "./utils/http";
import request from "./utils/request";

// 依赖接口
export const $http = http;
export const $request = request;

/**
 * 创建接口基础配置信息, 共 5 个方法。
 * 根据业务需求，覆盖对应实现即可
 *
 * @param {*} baseUrl
 * @param {*} tokenName
 * @param {*} getToken
 * @returns
 */
export function createBaseConf(
  baseUrl = "",
  tokenName = "",
  getToken = () => {
    return "";
  }
) {
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
      if (getToken()) {
        // token 放入 header 中
        let _header = {};
        _header[tokenName] = getToken();
        options.header = Object.assign(options.header || {}, _header);
      }
    },
    // 请求后置方法
    handleReturn(respData) {
      // 处理报错的请求
      if (respData._err) {
        Taro.showModal({
          title: "发生错误",
          content: respData.msg,
          showCancel: false,
          success: function (res) {},
        });
        return Promise.resolve(null);
      }
      // 正常
      return Promise.resolve(respData);
    },
  };
  return defaultConf;
}

/**
 * 根据 基础配置 与 URL配置，创建 API 实例。
 *
 * @param {*} baseConf
 * @param {*} urlConf
 * @param {*} mergeModule
 * @returns
 */
export function createAPI(baseConf, urlConf, mergeModule = false) {
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
            uc.before.call(uc, options);
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
            return reqReturn.then((respData) => {
              return uc.after.call(uc, respData);
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

  // 整合所有模块接口到顶层接口。
  // 注意：如有重名函数，则覆盖前一个
  if (mergeModule) {
    const apiNoModule = {};
    Object.keys(api).forEach((moduleNm) => {
      let mApi = api[moduleNm];
      Object.keys(mApi).forEach((moduleApiNm) => {
        apiNoModule[moduleApiNm] = mApi[moduleApiNm];
      });
    });
    return apiNoModule;
  }

  return api;
}

// 设置默认返回
export default {
  createAPI,
  createBaseConf,
  $http,
  $request,
};
