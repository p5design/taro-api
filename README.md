# taro-api

快速创建API接口（Taro 版）

## 快速开始

首选确保本地的 `Node Version >= 12.0`

### 1. 安装 taro-api

```bash
# 使用 npm 安装
npm i taro-api

# OR 使用 yarn 安装
yarn add taro-api
```

### 2. 复制示例代码

复制 `example` 目录到 `taro` 项目的 `src` 目录下，并改名为 `api` （随便改成你常用的就行）

完成操作后，目录结构如下：

```bash
$TARO-PROJECT/                         # TARO 项目根目录
  |-- src/                             # src 目录
  |   |-- api/                         # api 目录
  |   |   |-- modules/                 # 接口 模块目录
  |   |   |   |-- test.js              # 接口【test】
  |   |   |-- conf.js                  # api 配置文件
  |   |   |-- index.js                 # api 主文件
```

### 3. 填充参数与添加接口

打开文件 `conf.js`, 修改初始化需要的 3 个参数。

```js
// 接口服务器路径，一般为 https://xxxxx.com/api ， 最后不要带斜杠
let baseUrl = "";
// 用户验证使用 token 的名称，默认会将 token 值放置在请求 header 中
let tokenName = "";
// 获取 token 的方法，每次请求发送前会执行该方法
let getToken = () => {
  return "";
};
```

打开文件 `modules/test.js`, 修改接口的访问地址与方法。

```js
// 接口配置
const urlConf = {
  helloWorld: {                     // 自定义的方法名
    url: "/test/helloworld",        // 接口路径，发送的请求会在前面自动拼接 baseUrl
    method: "get",                  // 接口方法 默认为 get，支持 post, put, delete 等   
    before: handleOptions,          // 前置方法 conf.js 中定义，详情见 `自定义请求` 部分
    after: handleReturn,            // 后置方法 conf.js 中定义，详情见 `自定义请求` 部分
  }
};
```

### 4. 访问接口吧

```js
// 引入 api 接口
import $api from "src/api/index"

// 访问 test 模块下的 helloWorld 方法
$api.test.helloWorld({ a: 1 }).then((data) => {
  console.log("resp-data: " + JSON.stringify(data));
});
```