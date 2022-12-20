---
title: 输出
---

## 异步

`setTimeout` 的异步代码总是最后执行

```js
setTimeout(() => {
  console.log("g");
}, 0);

console.log("a");

Promise.resolve()
  .then(() => console.log("b"))
  .then(() => console.log("c"));

new Promise((resolve) => {
  console.log("d");
  resolve();
})
  .then(() => console.log("e"))
  .then(() => {
    console.log("f");
  });

//  a d b e c f g
```

`async` 在遇到 `await` 前都是同步的

```js
function getUserId() {
  return Promise.resolve();
}

async function async1() {
  console.log(1);

  await async2();

  console.log(2);
}

async function async2() {
  console.log(3);

  await getUserId();

  console.log(4); // 会等待 getUserId 执行结束
}

async1();

console.log(5);

// 1 3 5 4 2
```

`promise` 回调函数是同步的, `resolve` 和 `reject` 才是异步的

```js
const promise = new Promise((resolve) => {
  console.log('hello');

  resolve('!');

  console.log('-')
}).then((res) => console.log(res));

console.log('world');
// hello
// -
// world
// !
```

### 事件循环(Event Loop)

:::info 什么是事件循环?

js 引擎遇到一个 `异步` 事件后并不会一直等待其返回结果, 而是会将这个 `事件挂起` , 继续执行执行栈中的其他任务, 当一个异步事件 `返回结果` 后, js 会将这个事件加入与当前 `执行栈` 不同的 `另一个` 队列, 即 `事件队列` , 被放入事件队列 `不会立刻执行` 其回调, 而是等待当前执行栈中的所有任务都执行完毕, `主线程` 处于 `闲置状态` 时, 主线程会去查找事件队列是否有任务, 如果有, 那么主线程会从中取出 `排在第一位` 的事件, 并把这个事件对应的回调 `放入执行栈` 中, 然后执行其中的同步代码, 如此反复, 这样就形成了一个无限的循环, 即 `事件循环`

:::

执行栈执行完毕时会立刻 `先处理` 所有 `微任务队列` 中的事件, 然后再去宏任务队列中取出一个事件

:::info 宏任务与微任务

宏任务: setTimeout, setInterval, requestAnimationFrame

微任务: Promise.resolve().then(), MutationObserver

:::

## 作用域

```js
var b = 10;

(function b() {
  b = 20;
  console.log(b);
})();

// 浏览器输出 
// b() {
//   b = 20;
//   console.log(b);
// }
// nodejs 报错
```

```js
// es6 新增块级作用域
var i = 5;

function fun() {
  console.log(i); // undefined
  if (true) {
    var i = 6; // 变量提升, 导致块内 i 未定义
    console.log(i); // 6
  }
}

fun();
```

### es5 模仿块级作用域

```js{4}
// 正常情况下输出结果
function func() {
  for (var i = 0; i < 3; i++) {}
  console.log(i); // 3
}

func();
```

```js{7}
// 使用立即执行函数实现块级作用域
function func() {
  (function () {
    for (var i = 0; i < 3; i++) {}
  })();

  console.log(i); // ReferenceError: i is not defined
}

func();
```

### 作用域链

```js
var a = 100; // 全局作用域

function func1() {
  var b = 200; // func1 作用域

  function func2() {
    var c = 300; // func2 作用域

    // 当前作用域没有的变量
    // 会一级一级往上找, 形成作用域链
    console.log(a);
    console.log(b);
    console.log(c);
  }

  func2();
}

func1();
```

## 优先级

```js
// 从左往右比较
const a = 1 < 2 < 1 < 1 ? 3 : 4; // 3
```

## 函数

```js
const far = function bar() {
  return 123;
};

// ReferenceError: bar is not defined
console.log(typeof bar());
```