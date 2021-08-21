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
    before: handleOptions,          // 前置方法 详情见 `自定义请求` 部分
    after: handleReturn,            // 后置方法 详情见 `自定义请求` 部分
  }
};
```

### 4. 访问接口

```js
// 引入 api 接口
import $api from "src/api/index"

// 访问 test 模块下的 helloWorld 方法
$api.test.helloWorld({ a: 1 }).then((data) => {
  console.log("resp-data: " + JSON.stringify(data));
});
```

## 自定义请求

配置文件为 `conf.js`, 主要在 `请求发送前` 与 `响应收到后` 这两个时间节点预留了钩子方法，方便进行定制。

具体创建 `基础配置信息` 请参考实例代码 `example/conf.js`，其中 `createBaseConf` 方法，返回的对象中包含以下五个函数，根据业务需求重写对应方法即可。


| 触发时机   | 方法                   | 参数说明           | 功能                           | 默认实现                                 |
| ---------- | ---------------------- | ------------------ | ------------------------------ | ---------------------------------------- |
| 请求发送前 | getBaseUrl(url)        | url: 请求地址      | 根据url路径返回对应的 BASE_URL | 直接返回 BASE_URL                        |
| 请求发送前 | showLoading()          | 无参数             | 显示加载提示                   | 调用小程序 showNavigationBarLoading 方法 |
| 请求发送前 | handleOptions(options) | options： 请求配置 | 处理请求数据                   | 将 token 设置到请求的 header 中          |
| 响应收到后 | hideLoading()          | 无参数             | 隐藏加载提示                   | 调用小程序 hideNavigationBarLoading 方法 |
| 响应收到后 | handleReturn(respData) | respData：响应数据 | 处理响应数据                   | 对响应数据做统一的错误处理               |


其中最重要的两个方法为 `handleOptions` 与 `handleReturn`, 具体参数与定制化行为请参考下文。

### handleOptions(options) 方法详解

`options` 对象属性如下：

| 属性名  | 类型   | 说明                                        |
| ------- | ------ | ------------------------------------------- |
| baseURL | string | 接口前置，包含服务器地址                    |
| url     | string | 接口路径                                    |
| method  | string | 支持 get, post, postForm, delete, put       |
| params  | object | 存放 get 请求参数                           |
| data    | object | 存放 post 请求参数                          |
| header  | object | http 的 header，一般用来存放 token 一类数据 |


例如：

```json
{
  baseURL: "https://xxxxx.com/api",
  url: "/test/helloworld",
  method: "get",
  params: {},
  data: {},
  header: {
    "Content-Type": "application/json;charset=UTF-8",
    "Token": "xxxxx"
  },
}
```

`handleOptions` 的工作就是在发送请求前，对请求参数做处理，默认实现如下：

```js
function handleOptions (options) {
  // 将 token 加入请求的 header 中
  if (getToken()) {
    let _header = {};
    _header[tokenName] = getToken();
    options.header = Object.assign(options.header || {}, _header);
  }
}
```

### handleReturn(respData) 方法详解

`respData` 的格式为 `json`。原始的请求响应在进入 `handleReturn` 方法前会进行预处理，按照 `statusCode` 的范围返回 `正常响应` 与 `错误响应` 两种返回值。

下面是大概的预处理流程：

```js
let status = response.statusCode
let data = response.data
// 正常响应
if ((status >= 200 && status < 300) || status === 304) {
  return data;
} 
// 错误响应
else {
  // 根据 status 值，定制了错误信息. 下面展示 401 错误
  let errorKey = "http.status.401";         // 错误码，可用来做国际化    
  let errorMsg = "401：访问令牌无效或已过期"; // 错误码对应信息，默认为中文
  return {
    _err: true,
    error: errorKey,
    msg: errorMsg,
    status: status,
    data: data,
  }
}
```

`handleReturn` 的工作就是在收到请求后，对响应结果做统一处理，默认实现如下：

```js
function handleReturn(respData) {
  // 错误，统一做弹窗提示
  if (respData._err) {
    Taro.showModal({
      title: "发生错误",
      content: respData.msg,
      showCancel: false,
    });
    return Promise.resolve(null);
  }
  // 正常
  return Promise.resolve(respData);
}
```


## 自定义接口

## 更底层的访问接口




