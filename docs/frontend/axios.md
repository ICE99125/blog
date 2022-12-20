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