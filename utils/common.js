// 提供一些常用 utility 方法

/**
 * 将参数转为 queryString 添加到 url 中
 * @param {*} url
 * @param {*} params
 * @returns
 */
export function urlQuery(url, params) {
  if (!params) {
    return url;
  }
  let qstr = params2Query(params);
  if (qstr) {
    if (url.indexOf("?") !== -1) {
      return url + "&" + qstr;
    } else {
      return url + "?" + qstr;
    }
  } else {
    return url;
  }
}

/**
 * 参数转换为 queryString 格式
 * @param {*} params
 * @returns
 */
export function params2Query(params = {}) {
  var qstr = Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
    .join("&");
  return qstr;
}

/**
 * 填充默认内容
 *
 * stringTemplate("hello ${name}", {name: "pw"}) // "hello pw"
 *
 * @param {*} tmpl
 * @param {*} context
 * @returns
 */
export function stringTemplate(tmpl, context) {
  return tmpl.replace(/\${(.*?)}/g, (match, key) => context[key.trim()]);
}
