---
title: this
---

## 普通函数

指向其作用域

```js
function fn() {
  console.log(this);
}

fn(); // 非严格模式下 window, 严格模式下为 undefined
// 其实是谁调用则 this 指向谁
window.fn(); // window
```

```js
const o1 = {
  text: 'o1',
  fn: function () {
    return this.text;
  },
};

const o2 = {
  text: 'o2',
  fn: o1.fn,
};

// 等价于
// const o2 = {
//   text: 'o2',
//   fn: function () {
//     return this.text;
//   },
// };

console.log(o2.fn()); // o2 调用了 function
```

### 闭包

```js
function a() {
  console.log(this);
}

const b = {
  a: 'b',
  fn: function () {
    return a(); //  window
  },
};

b.fn(); // 因为没有任何对象调用 a(), 因此非严格模式下是 window
```

```js
const b = {
  a: 'b',
  fn: function () {
    console.log(this);

    return (function () {
      console.log(this); // window, 同理
    })();
  },
};

b.fn();
```

```js
const b = {
  a: 'b',
  fn: function () {
    return function () {
      console.log(this);
    };
  },
};

b.fn()(); // window, 其实 b.fn 相当于 a, 这里就等价于 a();
// 也是没有任何对象调用 a(), 所以指向 window
```

```js
// 闭包中改变 this 指向
const b = {
  a: 'b',
  fn: function () { // 这个函数由于是 b 调用的, 其 this 指向 b
    // console.log(this === b); // true
    function abc() {
      console.log(this);
    };

    return abc.bind(this);
  },
};

b.fn()();

```

## 箭头函数

指向声明时所在作用域的 this

```js
function fn() {
  // fn 的 this 指向其作用域 window
  setTimeout(() => {
    console.log(this);
  }, 100);
}

fn(); // window
```

```js
const fn = () => {
  console.log(this); // window
}
```

## 对象函数

```js
class Person {
  constructor() {
    this.name = 'xiaomi';
  }
  getName() {
    console.log(this.name); // 这里 this 指向实例
  }
}

let p = new Person();
p.getName(); // xiaomi

let t = p.getName;
t(); // undefined
```

## call/apply

接收参数立即执行

```js
function product(name, price) {
  this.name = name;
  this.price = price;
}

function food(name, price) {
  product.call(this, name, price);
}

let f = new food('cheese', 5);
console.log(f.name); // cheese
```

等价于

```js
function product(that, name, price) {
  that.name = name;
  that.price = price;
}

function food(name, price) {
  product(this, name, price);
}

let f = new food('cheese', 5);
console.log(f.name); // cheese
```

```js
// 接收参数数组
product.apply(this, [name, price]);
```

## bind

接收参数但不执行

```js
// 闭包实现自定义 bind
Function.prototype.myBind = function (ctx, ...args) {
  const func = this;

  return function () {
    func.apply(ctx, args);
  };
};
```
