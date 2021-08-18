import { createBaseConf } from "taro-api";

// 1. 准备基础配置参数
let baseUrl = "";
let tokenName = "";
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
