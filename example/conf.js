import { createBaseConf } from "taro-api";

// 1. 配置基础配置参数

// 接口服务器路径，一般为 https://xxxxx.com/api ， 最后不要带斜杠
let baseUrl = "";
// 用户验证使用 token 的名称，默认会将 token 值放置在请求 header 中
let tokenName = "";
// 获取 token 的方法，每次请求发送前会执行该方法
let getToken = () => {
  return "";
};

// 2. 创建基础配置信息
let baseConf = createBaseConf(baseUrl, tokenName, getToken);

// 3. 根据业务需求，对内置方法进行 重载 或 扩展
// baseConf.getBaseUrl(url){ };
// baseConf.showLoading(){ };
// baseConf.hideLoading(){ };
// baseConf.handleOptions(options){ };
// baseConf.handleReturn(respData){ };

// 4. 设置为默认返回
export default baseConf;
