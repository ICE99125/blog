---
title: 高级函数
---

## once

```js
function once(fn) {
  return function (...args) {
    if (fn) {
      fn.apply(this, args);
      fn = null;
    }
  };
}

const o = once(function () {
  console.log('once');
});

o(); // once
o();
```

## debounce

:::info 防抖函数

调用多次, 只执行最后一次

1. 登录、发短信等按钮避免用户点击太快

2. 页面大小变化避免 resize 过于频繁

3. 文档编辑器实时保存, 无更改后自动保存

:::

```js
function debounce(fn, dur = 1000) {
  let timer;

  return function (...args) {
    clearTimeout(timer); // 计时器还在就清掉
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, dur);
  };
}

d = debounce(function () {
  console.log('debounce');
});

d();
d(); // (1s 后)debounce
```

## throttle

:::info 节流函数
调用一次, 间隔一定时间才能继续调用

1. 搜索联想

2. 计算鼠标移动的距离

3. DOM 元素的拖拽功能实现

:::

```js
function throttle(fn, dur = 1000) {
  let timer;

  return function (...args) {
    if (!timer) {
      // 计时器不在才执行
      fn.apply(this, args);
      timer = setTimeout(() => {
        timer = null;
      }, dur);
    }
  };
}

t = throttle(function () {
  console.log('throttle');
});

t(); // throttle
t();
```

## consumer

间隔一定时间调用

```js
function consumer(fn, dur = 1000) {
  let tasks = [],
    timer;

  return function (...args) {
    tasks.push(fn.bind(this, ...args));

    if (timer == null) {
      timer = setInterval(() => {
        tasks.shift().call(this); // 取出后调用

        if (tasks.length <= 0) {
          clearInterval(timer);
          timer = null;
        }
      }, dur);
    }
  };
}

let count = 0;
const c = consumer(() => {
  console.log(count++);
});

c(); // 0
c(); // 1
c(); // 2
```

## deepCopy

只要不是对象或数组, 都是新值而非地址

```js
function deepCopy(obj = {}) {
  // obj 不是对象则直接返回
  // typeof null === 'object'
  if (typeof obj !== 'object' || obj === null) return obj;

  const newObj = Array.isArray(obj) ? [] : {};

  // 不需要拷贝 obj 原型上的属性和方法, 因此这里不用 in/of
  // Reflect.ownKeys 可以访问不可枚举属性(包括 Symbol), Object.keys 不行
  Reflect.ownKeys.forEach((key) => {
    newObj[key] = deepCopy(obj[key]);
  });

  return newObj;
}

const obj = {
  id: 1,
  name: 'andy',
  msg: {
    age: 18,
  },
  color: ['red', 'pink'],
};

const newObj = deepCopy(o);

newObj.msg.age = 19;

console.log(newObj, obj);
```

```js
// Date 会变成字符串
// undefined 丢失
// 原型链丢失
JSON.parse(JSON.stringify(obj));
```

### shallowCopy

```js
const newArr = [...arr];
// 也可以
// const newArr = [];
// Array.prototype.push.apply(newArr, arr);
// 或者 newArr.concat(arr);
```

```js
const newObj = { ...obj };
```

```js
const newObj = Object.assign({}, obj);
```

```js
const newObj = Object.create(
  Object.getPrototypeOf(obj), // 原型
  Object.getOwnPropertyDescriptors(obj) // 属性
);
```

```js
// 手写浅拷贝
function shallowCopy(obj = {}) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const newObj = Array.isArray(obj) ? [] : {};

  Reflect.ownKeys(obj).forEach((key) => {
    newObj[key] = obj[key];
  });

  return newObj;
}
```

## flat

```js
function MyFlat(arr) {
  const res = [];

  for (let a of arr) {
    if (Array.isArray(a)) {
      res.push(...MyFlat(a));
    } else {
      res.push(a);
    }
  }

  return res;
}
```

## onion model(洋葱模型)

```js
function compose(...funcs) {
  return function () {
    const exec = (idx) => {
      const func = funcs[idx];

      if (typeof func !== 'function') return;

      func(() => {
        exec(idx + 1); // 作为 next
      });
    };

    exec(0); // 立即执行一次
  };
}

function f(next) {
  console.log(1);
  next();
  console.log(2);
}

function d(next) {
  console.log(3);
  next();
  console.log(4);
}

const fn = compose(f, d);
fn(); // 1 3 4 2
```

## curry(柯里化)

```js
function curry(fn) {
  const len = fn.length;
  const _args = [];

  function argsCollector(...args) {
    _args.push(...args);

    if (_args.length === len) {
      // 已经收集到足够的参数了
      return fn.apply(this, _args);
    } else {
      return argsCollector; // 继续收集参数
    }
  }

  return argsCollector;
}

function add(a, b, c) {
  return a + b + c;
}

const a = curry(add)(2);

console.log(a(2, 3)); // 7
```

## chunk(数组分块)

```js
function chunk(arr, step = 1) {
  if (!Array.isArray(arr)) throw new TypeError();

  const res = [];
  for (let i = 0; i < arr.length; i += step) {
    res.push(arr.slice(i, i + step));
  }

  return res;
}

console.log(chunk([1, 2, 3, 4, 5, 6, 7], 2));
// [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ], [ 7 ] ]

console.log(chunk([1, 2, 3, 4, 5, 6, 7], 3));
// [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7 ] ]
```

## intersection(获取数组交集)

```js
function intersection(arr, ...args) {
  // 过滤出那些在 args 里都存在的元素
  return arr.filter((el) => args.every((e) => e.includes(el)));
}

console.log(intersection([1, 2], [2, 4, 5], [2, 3])); // [2]
```
