# axios

## ajax

Async Javascript and XML

```js
// 创建 XMLHttpRequest 实例
let xhr = XMLHttpRequest();

// 打开和服务器的连接
xhr.open('get', 'http://....');

// 发送
xhr.send();

// 接收变化
xhr.onreadystatechange = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log(xhr.responseText); // 响应主体
  }
};
```

### readyState

1. `0` 刚创建实例

2. `1` 已调用 `send()` 正在发送请求

3. `2` 已经接收到响应内容

4. `3` 正在解析响应内容

5. `4` 响应主体内容解析完成

### 使用 promise 封装

```js
function ajax(url, method, data) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          resolve(xhr.response);
        } else {
          reject(new Error('error'));
        }
      }
    };

    if (method.toUpperCase() === 'GET') {
      let params = [];
      for (key in data) {
        params.push(key + '=' + data[key]);
      }

      url = `${url}?${params.join('&')}`;
      xhr.open('get', url, false);
      xhr.send();
    } else if (method.toUpperCase() === 'POST') {
      xhr.open('post', url, false);
      xhr.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded;charset=utf-8'
      );

      xhr.send(data);
    }
  });
}
```

## fetch 与 ajax

1. `fetch` 只有网络错误或者无法连接时才会抛出错误

2. `fetch` 基于 `promise` , 是 `js` 原生 `api`

3. `fetch` 不支持 `abort` , 不支持超时控制

## Axios 源码

### axios

```js
import axios from 'axios';

// 工厂模式
const ax = axios.create({
  /* configs */
});

ax.get(url);

// 直接发送请求
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone',
  },
});

axios(url); // 只有 url 的形式
```

```js
// 工厂模式
function createInstance(defaultConfig) {
  const context = new Axios(defaultConfig);

  // request 函数, 但是 this 指向 context
  const instance = bind(Axios.prototype.request, context);

  // 复制 Axios.prototype 到实例上
  utils.extend(instance, Axios.prototype, context, { allOwnKeys: true });

  // 复制 context 到实例上
  utils.extend(instance, context, null, { allOwnKeys: true });

  // 工厂核心, 在 instance 上加入 create 函数(静态属性)
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// axios 指向 instance(即 request 函数)
// 因此我们可以使用 axios.create() 新建多个实例
// 或者 axios({}) 直接发送请求
const axios = createInstance(defaults);

// ...

export default axios;
```

### Axios

```js
// 拦截器

class InterceptorManager {
  constructor() {
    // {
    //   fulfilled: (config) { ... }
    //   rejected: (err) { ... }
    //   synchronous: boolean
    //   runWhen: (config) { ... }
    // }
    this.handlers = [];
  }

  // 注册一个拦截器
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,

      // 条件执行
      // axios.interceptors.request.use(config => { return config }, err => {}, {
      //     runWhen: config => {
      //         return config.headers.token ? true : false
      //     }
      // })
      runWhen: options ? options.runWhen : null,
    });

    // 返回拦截器对象方便删除拦截器
    // const xx = axios.interceptors.request.use(function () { /*...*/ });
    // axios.interceptors.request.eject(xx);

    return this.handlers.length - 1;
  }

  // 移除拦截器
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  // 清空拦截器
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  forEach(fn) {
    this.handlers.forEach((h) => {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
```

```js
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig; /* 实例的配置, 如 baseURL, timeout 等 */

    // 拦截器
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }

  request(configOrUrl, config) {
    if (typeof configOrUrl === 'string') {
      // 允许 axios(url) 这样使用
      config = config || {};
      config.url = configOrUrl;
    } else {
      // 允许 axios({ ... }) 这样使用
      config = configOrUrl || {};
    }

    // 合并默认配置和自定义配置
    config = mergeConfig(this.defaults, config);

    const { headers } = config;

    // ...

    // 有自定义方法就用自定义的, 否则默认的, 默认的也没有就用 'get'
    config.method = (
      config.method ||
      this.defaults.method ||
      'get'
    ).toLowerCase() /* 允许我们用大写, 如 method: 'GET' */;

    let contextHeaders;

    contextHeaders =
      headers &&
      utils.merge(headers.common /* 默认值 */, headers[config.method]);

    contextHeaders &&
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'].forEach(
        (method) => delete headers[method]
      );

    config.headers = AxiosHeaders.concat(contextHeaders, headers);

    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true; // 默认拦截器是异步的

    this.interceptors.request.forEach((interceptor) => {
      if (
        typeof interceptor.runWhen === 'function' &&
        interceptor.runWhen(config) === false
      ) {
        return;
      }

      // 所有的拦截器都是同步的, 才会同步执行拦截器
      synchronousRequestInterceptors =
        synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(
        interceptor.fulfilled,
        interceptor.rejected
      );
    });

    const responseInterceptorChain = [];

    this.interceptors.response.forEach((interceptor) => {
      responseInterceptorChain.push(
        interceptor.fulfilled,
        interceptor.rejected
      );
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      // 所有拦截器异步执行
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    // 所有拦截器同步执行
    len = requestInterceptorChain.length;

    let newConfig = config;

    i = 0;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(
        responseInterceptorChain[i++],
        responseInterceptorChain[i++]
      );
    }

    return promise;
  }

  // ...
}
```

### Error

```js
const descriptors = {}; // 错误类型描述符

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL',
].forEach((code) => {
  descriptors[code] = { value: code };
});
```

```js
utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils.toJSONObject(this.config),
      code: this.code,
      status:
        this.response && this.response.status ? this.response.status : null,
    };
  },
});
```

自定义抛出错误代码

```js
axios.get('/user/12345', {
  validateStatus: function (status) {
    return status < 500; // 处理状态码小于500的情况
  },
});
```

```js
function settle(resolve, reject, response) {
  const validateStatus = response.config.validateStatus;

  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(
      new AxiosError(
        'Request failed with status code ' + response.status, // message
        [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][
          Math.floor(response.status / 100) - 4
        ], // code, 即 descriptors
        response.config,
        response.request,
        response
      )
    );
  }
}
```

### xhr

```js
// 是否支持 xhr
const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

// 不支持返回 undefined, 支持返回 promise
export default isXHRAdapterSupported &&
  function (config) {
    return new Promise((resolve, reject) => {
      let requestData = config.data;
      const requestHeaders = AxiosHeaders.from(config.headers).normalize();
      const responseType = config.responseType;
      let onCanceled;

      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }

      if (
        utils.isFormData(requestData) &&
        (platform.isStandardBrowserEnv ||
          platform.isStandardBrowserWebWorkerEnv)
      ) {
        requestHeaders.setContentType(false);
      }

      let request = new XMLHttpRequest();

      // 用户认证
      if (config.auth) {
        const username = config.auth.username || '';
        const password = config.auth.password
          ? unescape(encodeURIComponent(config.auth.password))
          : '';
        requestHeaders.set(
          'Authorization',
          'Basic ' + btoa(username + ':' + password)
        );
      }

      const fullPath = buildFullPath(config.baseURL, config.url);

      // 打开和服务器的连接
      request.open(
        config.method.toUpperCase(),
        buildURL(fullPath, config.params, config.paramsSerializer),
        true
      );

      // 设置超时时间
      request.timeout = config.timeout;

      function onloadend() {
        if (!request) return;

        // 准备响应
        const responseHeaders = AxiosHeaders.from(
          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
        );

        const responseData =
          !responseType || responseType === 'text' || responseType === 'json'
            ? request.responseText
            : request.response;

        // 响应体
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request,
        };

        // 根据状态码、用户自定义验证器来确定返回
        settle(
          (value) => {
            resolve(value);
            done();
          },
          (err) => {
            reject(err);
            done();
          },
          response
        );

        request = null; // 清空请求
      }

      if ('onloadend' in request) {
        request.onloadend = onloadend;
      } else {
        // 监听 ready 状态
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          if (
            request.status === 0 &&
            !(request.responseURL && request.responseURL.indexOf('file:') === 0)
          ) {
            return;
          }

          setTimeout(onloadend);
        };
      }

      // 取消请求
      request.onabort = function handleAbort() {
        if (!request) return; // 如果请求已经完成/取消, 什么都不做

        reject(
          new AxiosError(
            'Request aborted',
            AxiosError.ECONNABORTED,
            config,
            request
          )
        );

        // 清空请求
        request = null;
      };

      // 网络错误
      request.onerror = function handleError() {
        reject(
          new AxiosError(
            'Network Error',
            AxiosError.ERR_NETWORK,
            config,
            request
          )
        );

        request = null;
      };

      // 超时错误
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = config.timeout
          ? 'timeout of ' + config.timeout + 'ms exceeded'
          : 'timeout exceeded';
        const transitional = config.transitional || transitionalDefaults;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }

        reject(
          new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError
              ? AxiosError.ETIMEDOUT
              : AxiosError.ECONNABORTED,
            config,
            request
          )
        );

        request = null;
      };

      // 只有浏览器中才需要
      if (platform.isStandardBrowserEnv) {
        // 添加 xsrf header
        const xsrfValue =
          (config.withCredentials || isURLSameOrigin(fullPath)) &&
          config.xsrfCookieName &&
          cookies.read(config.xsrfCookieName);

        if (xsrfValue) {
          requestHeaders.set(config.xsrfHeaderName, xsrfValue);
        }
      }

      // 如果 data 是 undefined 则移除 Content-Type
      requestData === undefined && requestHeaders.setContentType(null);

      if ('setRequestHeader' in request) {
        utils.forEach(
          requestHeaders.toJSON(),
          function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          }
        );
      }

      // 添加凭据
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // 添加响应类型
      if (responseType && responseType !== 'json') {
        request.responseType = config.responseType;
      }

      // 处理网络下载进度
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener(
          'progress',
          progressEventReducer(config.onDownloadProgress, true)
        );
      }

      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener(
          'progress',
          progressEventReducer(config.onUploadProgress)
        );
      }

      if (config.cancelToken || config.signal) {
        onCanceled = (cancel) => {
          if (!request) return;

          reject(
            !cancel || cancel.type
              ? new CanceledError(null, config, request)
              : cancel
          );

          request.abort();
          request = null;
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        
        if (config.signal) {
          config.signal.aborted
            ? onCanceled()
            : config.signal.addEventListener('abort', onCanceled);
        }
      }

      const protocol = parseProtocol(fullPath);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(
          new AxiosError(
            'Unsupported protocol ' + protocol + ':',
            AxiosError.ERR_BAD_REQUEST,
            config
          )
        );
        return;
      }

      // 发送请求
      request.send(requestData || null);
    });
  };
```

### API

```js
['delete', 'get', 'head', 'options'].forEach((method) => {
  // 在 Axios 的原型上加入 API
  Axios.prototype[method] = function (url, config) {
    return this.request(
      /* 实际上是调用了 request 函数 */
      mergeConfig(config || {}, {
        method,
        url,
        data: (config || {}).data,
      })
    );
  };
});

['post', 'put', 'patch'].forEach((method) => {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(
        mergeConfig(config || {}, {
          method,
          headers: isForm /* 数据的编码方式 */
            ? {
                'Content-Type': 'multipart/form-data',
              }
            : {},
          url,
          data,
        })
      );
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});
```

## buildUrl

```ts
function encode(val: string) {
  // 把字符串作为 URI 组件进行编码
  return encodeURIComponent(val)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

// 序列化参数
function serializeParams(params: Record<string, any>) {
  return Object.keys(params)
    .map((k) => {
      const v = params[k];
      return Array.isArray(v) ? [`${k}[]`, v] : [k, [v]];
    })
    .reduce((parts, entry) => {
      if (entry === null) return parts;

      const [key, value] = entry;

      return parts.concat(
        value
          .filter((v) => v)
          .map((v) => {
            if (v instanceof Date) {
              v = v.toISOString();
            } else if (v instanceof Object) {
              v = JSON.stringify(v);
            }

            return v ? `${encode(key)}=${encode(v)}` : v;
          })
      );
    }, [])
    .join('&');
}

function buildURL(url: string, params: string) {
  if (!params) {
    // 不存在 params(get 请求参数), 直接返回 url
    return url;
  }

  return url + (url.indexOf('?') === -1 ? '?' : '&') + serializeParams(params);
}
```

