---
title: 其他
---

## null 与 undefined

* `null` 表示没有对象

  ```js
  Object.prototype.__proto__ = null; // true
  ```

  ```js
  typeof null === 'object';
  ```

* `undefined` 表示未定义

  ```js
  typeof undefined === 'undefined';
  ```

## type 与 interface

* 都可以扩展

  ```ts
  interface Name { 
    name: string; 
  }

  interface User extends Name { 
    age: number; 
  }
  ```

  ```ts
  type Name = { 
    name: string; 
  }

  type User = Name & { age: number  };
  ```

* `type` 可以声明基本类型, 元组以及联合类型, `interface` 不行

  ```ts
  // 基本类型
  type Name = string

  // 联合类型
  type Pet = Dog | Cat

  // 元组
  type PetList = [Dog, Pet]
  ```

* `interface` 可以声明合并

  ```ts
  interface User {
    name: string
    age: number
  }

  interface User {
    sex: string
  }
  ```

## 垃圾回收

### 标记清除

1. 垃圾收集器在运行时会给内存中的 `所有变量` 都加上一个标记, 假设内存中所有对象都是垃圾, 全标记为 `0`

2. 从各个 `根对象` 开始遍历, 把不是垃圾的节点改成 `1`

3. 清理所有 `标记为 0` 的垃圾, 销毁并回收它们所占用的内存空间

4. 把所有内存中对象标记修改为 `0` , 等待下一轮垃圾回收

:::info
该方法简单, 但是容易出现内存碎片, 重新分配内存效率低, 需要时不时暂停线程去清理
:::

### 引用计数

如果没有引用指向该对象(零引用), 对象将被垃圾回收机制回收

1. 当 `声明` 一个变量并且将一个引用类型赋值给该变量时这个值的引用次数就为 `1`

2. 如果同一个值又被 `赋给另一个变量` , 那么引用数 `加 1`

3. 如果该变量的值被其他的值 `覆盖` 了, 则引用次数 `减 1`

4. 当这个值的引用次数变为 `0` 的时候, 回收空间

:::info
计数器变为 0 时就立即回收, 不需要暂停线程, 但是存在循环引用问题, 计数器占用空间
:::

## 发布订阅

```js
const eventEmitter = {};

// 事件订阅
function on(event, fn) {
 if (typeof fn !== 'function' || fn.length !== 1) return;

  (eventEmitter[event] ?? (eventEmitter[event] = [])).push(fn);
}

// 事件发布
function emit(event, msg) {
  const fns = eventEmitter[event];

  if (!!fns) {
    // 逐条发布消息
    fns.forEach((fn) => {
        fn(msg);
    });
  }
}

// 订阅 article 消息
on('article', (content) => {
  console.log(`用户 1 订阅了: ${content}`);
});

on('article', (content) => {
  console.log(`用户 2 订阅了: ${content}`);
});

// 订阅 physical 消息
on('physical', (content) => {
  console.log(`用户 3 订阅了: ${content}`);
});

// 发布 article 消息
emit('article', 'hello world!');

// 订阅 physical 消息的用户不会收到通知
```

## 观察者模式

```js
// 观察者列表
const observerList = [];

// 消息通知
function notify(msg) {
  observerList.forEach((fn) => {
    fn(msg);
  });
}

// 消息订阅
function subscribe(fn) {
  if (typeof fn !== 'function' || fn.length !== 1) return;

  observerList.push(fn);
}

subscribe((msg) => {
  console.log(`观察者 1 收到消息: ${msg}`);
});

subscribe((msg) => {
  console.log(`观察者 2 收到消息: ${msg}`);
});

// 通知所有观察者
notify('hello world!');
```

## arguments

```js
// 类数组转成数组
Array.prototype.slice.call(arguments);
```

```js
Array.from(arguments);
```

```js
[...arguments];
```

箭头函数没有自己的 arguments

```js
function abc() {
  return function () {
    console.log([...arguments]);
  };
}

const a = abc(1, 2, 3);
a(4, 5, 6); // [ 4, 5, 6 ]
```

```js
function abc() {
  return () => {
    console.log([...arguments]);
  };
}

const a = abc(1, 2, 3);
a(4, 5, 6); // [ 1, 2, 3 ]
```

可以使用参数获取

```js{4}
function abc() {
  return (...args) => {
    console.log([...arguments]);
    console.log(args);
  };
}
```

## 内存泄露

* 意外的全局变量

  ```js
  function func() {
    age = 19;
  }

  func();

  delete window.age; // 不手动删除则在不关闭或刷新窗口的情况下一直存在
  ```

* 被遗忘的计时器

  ```js
  const timerId = setInterval(function () {
    const node = document.getElementById('Node');

    if (node) {
      node.innerHTML = new Date();
    }
  }, 1000);

  clearInterval(timerId); // 不再使用后清除定时器
  ```

* 分离的 DOM 引用

  ```html
  <body>
    <button id="button">移除列表</button>
    <ul id="list">
      <li>项目</li>
    </ul>
    <script type="text/javascript">
      const button = document.getElementById('button');
      const list = document.getElementById('list');

      button.addEventListener('click', function () {
        list.remove();
        // 点过一次后 dom 上已经没有 list 了
        // 但是 js 代码中还存在着 list 引用
      });
    </script>
  </body>
  ```

* 闭包

* `console.log` 所引用的变量不能被回收

:::info
控制台打印的对象点击查看时不是历史数据, 而是实时的
:::

## 判断类型

```js
function getType(value) {
  const match = Object.prototype.toString.call(value).match(/(\w+)]/);

  return match[1].toLocaleLowerCase();
}

console.log(getType(1)); // number
console.log(getType({})); // object
console.log(getType([])); // array
console.log(getType('1')); // string
console.log(getType(null)); // null
console.log(getType(undefined)); // undefined
```

参考 `axios`

```js
const kindOf = (function (cache) {
  return function (thing) {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
})(Object.create(null));
```

## 阻止冒泡

```js
// vue 中的 .stop
function stopPropagation(event) {
  const evt = event ?? window.event;

  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true; // IE 浏览器
  }
}
```

### 阻止默认事件

```js
evt.preventDefault();
// vue 中的 .prevent
```

## false 

```js
'' == false; // true
'' == []; // true
'' == 0; // true
'0' == false; // true
'0' == []; // false
false == []; // true
0 == []; // true
```

## 隐式转换

```js
// 会把数组变成字符串后拼接
[1,2] + [3,4] // 1,23,4

'5' * 5 // 25
'a' * 5 // NaN
```

## 判断平台

```js
function isAndroid() {
  return /android/i.test(navigator.userAgent.toLowerCase());
}

function isIOS() {
  const re = /iPhone|iPad|iPod|IOS|Macintosh/i;
  return re.test(navigator.userAgent.toLowerCase());
}
```

## 随机字符串

```js
function randomString(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  const length = chars.length;
  let res = '';

  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * length));
  }

  return res;
}
```

## 禁止网页事件

```js
const html = document.querySelector('html');
html.oncopy = () => false; // 禁止复制
html.onpaste = () => false; // 禁止粘贴
html.oncontextmenu = () => false; // 禁止右键
```