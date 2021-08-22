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

具体创建 `基础配置信息` 请参考示例代码 `example/conf.js`，其中 `createBaseConf` 方法，返回的对象中包含以下五个函数，根据业务需求重写对应方法即可。


| 触发时机   | 方法                   | 参数说明           | 功能                           | 默认实现                                 |
| ---------- | ---------------------- | ------------------ | ------------------------------ | ---------------------------------------- |
| 请求发送前 | getBaseUrl(url)        | url: 请求地址      | 根据url路径返回对应的 BASE_URL | 直接返回 BASE_URL                        |
| 请求发送前 | showLoading()          | 无参数             | 显示加载提示                   | 调用小程序 showNavigationBarLoading 方法 |
| 请求发送前 | handleOptions(options) | options： 请求配置 | 处理请求数据                   | 将 token 设置到请求的 header 中          |
| 响应收到后 | hideLoading()          | 无参数             | 隐藏加载提示                   | 调用小程序 hideNavigationBarLoading 方法 |
| 响应收到后 | handleReturn(respData) | respData：响应数据 | 处理响应数据                   | 对响应数据做统一的错误处理               |


其中最重要的两个方法为 `handleOptions` 与 `handleReturn`, 具体参数与定制化行为请参考下文。

### handleOptions(options) 方法详解

`options` 默认为空对象，可以覆写的对象属性如下：

| 属性名  | 类型   | 说明                                        |
| ------- | ------ | ------------------------------------------- |
| baseURL | string | 接口前置，包含服务器地址                    |
| url     | string | 接口路径                                    |
| method  | string | 支持 get, post, postForm, delete, put       |
| params  | object | 存放 get 请求参数                           |
| data    | object | 存放 post 请求参数                          |
| header  | object | http 的 header，一般用来存放 token 一类数据 |

根据不同的请求方式，接口会自动创建对应的请求参数，`options` 可以用来针对每个接口对这些参数进行定制化修改。

例如：

```bash
{
  baseURL: "https://xxxxx.com/api",
  url: "/test/helloworld",
  method: "get",
  params: {},
  data: {},
  header: {
    "Content-Type": "application/json;charset=UTF-8",
    "Token": "xxxxx"
  }
}
```

`handleOptions` 的工作就是在发送请求前，对请求参数做处理，默认实现为在 `header` 中加入 `token`。

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

如果不同的请求需要设置的参数不同，可以将对应方法增加到 `baseConf` 对象中，然后在接口的 `before` 参数上填充即可。

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

如果有不同的响应需要处理，可以将对应方法增加到 `baseConf` 对象中，然后在接口的 `after` 参数上填充即可。

## 自定义接口

`modules` 目录中的文件，每一个被当做单独的一个模块，并且以文件名（不带.后缀）作为模块的名称。

具体创建 `接口信息` 请参考示例代码 `example/modules/test.js`，其中 `urlConf` 的具体配置规则请参考下文。

### 模块下的接口

`urlConf` 对象中的每个方法对应一个 API 接口，方法名尽量起的与接口含义一致，例如：

```js
// 文件 modules/user.js 

const urlConf = {
  login: {/* 接口详细配置 */},
  sign:  {/* 接口详细配置 */},
};
```

使用上面定义接口的也很简单


```js
// 引入 api 接口
import $api from "src/api/index"

// 访问 loign 方法
$api.user.login({/* 参数 */ }).then((data) => {/* 处理返回结果 */});

// 访问 sign 方法
$api.user.sign({/* 参数 */ }).then((data) => {/* 处理返回结果 */});

```



### 接口详细配置

接口包含以下几个参数：

| 属性名      | 类型                   | 必填 | 默认值           | 说明                                |
| ----------- | ---------------------- | ---- | ---------------- | ----------------------------------- |
| url         | `string`               | 是   | 无               | 接口路径，支持 `RESETful API` 写法  |
| baseURL     | `string`               | 否   | `conf.js` 中提供 | 接口前置，包含服务器地址            |
| method      | `string` or `function` | 否   | `get`            | 常见的请求方法与特殊的 `'function'` |
| before      | `function`             | 否   | 无               | 请求发送前触发                      |
| after       | `function`             | 否   | 无               | 响应收到后触发                      |
| showLoading | `boolean`              | 否   | `false`          | 自动显示/隐藏加载提示               |

1. `url` 即改接口的路径，同样支持 `RESETful API`

2. `baseURL` 默认使用 `conf.js` 中的 `getBaseUrl` 方法返回值进行填充，主要用于使用第三方 API 接口时，覆写该值。

3. `method` 支持常见的 `get`, `post`, `put`, `delete`, 默认都以 `json` 格式提交数据。 如需使用 `form` 表单格式，请使用 `postForm`。
   
   在一些特殊情况下，比如获取某些资源文件（例如图片，视频等），可以将一个方法赋值给 `method` 参数，该方法会被调用并拿到接口对应的上下文，方便你拼接 拼接一个 `url` 字符串并返回。

4. `before` 请求发送前触发该方法，并将请求配置 `options` 参数传入，可以根据业务需要选项是否设置该方法，一般会设置 `conf.js` 中 `handleOptions` 方法。 

5. `after` 响应收到后触发该方法，并将预处理后的 `respData` 参数传入，可以根据业务需要选项是否设置该方法，一般会设置 `conf.js` 中 `handleReturn` 方法。 

6. `showLoading` 是否自动的显示加载提示，提示具体实现在 `conf.js` 中由 `showLoading` 和 `hideLoading` 定义。


下面为各种使用情况的例子，可以作为参考。


```js
// 接口定义
// 文件 modules/user.js 
import baseConf from "../conf";
let { handleOptions, handleReturn } = baseConf;

// login，sign 为未登录状态接口，无需设置 token，所以没有设置 before 参数

const urlConf = {
  // GET 请求
  login: {
    url: "/user/login",
    after: handleReturn
  },
  // POST 请求
  sign:  {
    url: "/user/sign",
    method: "post",
    after: handleReturn
  },
  // POST 请求, FORM 表单格式提交数据
  addUser:  {
    url: "/user/add",
    method: "postForm",
    before: handleOptions,
    after: handleReturn,
  },
  // PUT 请求
  updateUser:  {
    url: "/user/update",
    method: "put",
    before: handleOptions,
    after: handleReturn,
  },
  // DELETE 请求 
  deleteUser: {
    url: "/user/delete",
    method: "delete",
    before: handleOptions,
    after: handleReturn,
  },
  // GET 请求，RESTful API 格式
  getUserById: {
    url: "/user/get/${userId}",
    before: handleOptions,
    after: handleReturn,
  },
  // 第三方登陆接口，比如微信登陆
  loginByWeixin: {
    baseURL: "https://api.weixin.com/xxxx",
    url: "/login/code",
    method: "post",
    before: handleOptions,
    after: handleReturn,
  }
};
```




