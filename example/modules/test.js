import baseConf from "../conf";

// 准备 before，after 相关函数
let { handleOptions, handleReturn } = baseConf;

// 接口配置
const urlConf = {
  helloWorld: {
    url: "/test/helloworld",
    method: "get",
    before: handleOptions,
    after: handleReturn,
  },
  sayMyName: {
    url: "/test/saymyname",
    method: "post",
    before: handleOptions,
    after: handleReturn,
  },
};

// 设置为默认返回
export default urlConf;
