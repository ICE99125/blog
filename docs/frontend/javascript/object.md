---
title: 对象
---

## 原型

1. 构造函数的 prototype 的 \_\_proto\_\_ 指向其父类的 prototype

```js
class P {}
class ABC extends P {}
console.log(ABC.prototype.__proto__ === P.prototype); // true
```

2. 实例的 \_\_proto\_\_ 指向其构造函数的 prototype

```js
class ABC {}
const abc = new ABC();
console.log(ABC.prototype === abc.__proto__); // true
```

3. 构造函数指向类

或者说使用 `class` 声明的类本身就是一个函数

```js
class ABC {}

console.log(ABC.prototype.constructor === ABC); // true
```

4. 静态属性在构造函数上, 不会被实例 “继承”

```js
class ABC {
  static abc = 10;
}

ABC.def = 10;

// 等价于 console.log(ABC.prototype.constructor.abc);
// 因此不在实例的 __proto__ 上
console.log(ABC.abc); // 10
console.log(ABC.def); // 10
```

5. 所有类方法都在原型上

```js
class ABC {
  func() {
    console.log('func');
  }
}

ABC.prototype.func(); // func
```

## this

谁调用类方法其 `this` 就指向谁

```js
class ABC {
  func() {
    console.log(this === ABC.prototype);
  }
}

ABC.prototype.func(); // true
```

```js
class ABC {
  func() {
    console.log(this === b);
  }
}

var b = new ABC();
b.func(); // true
```

## new

1. 在内存中创建一个新的空对象

2. 设置原型, 将对象的原型设置为函数的 `prototype` 对象

3. 让 `this` 指向这个新对象

4. 执行构造函数里面的代码

5. 判断函数的返回值类型

```js
function New(fn, ...args) {
  // 对象的原型设置为构造函数的原型
  const obj = Object.create(fn.prototype);
  const res = fn.apply(obj, args);

  // 构造函数如果返回对象, 则返回这个对象
  return res instanceof Object ? res : obj;
}

// 构造函数
function Constructor(name, age) {
  this.name = name;
  this.age = age;
}

const obj = New(Constructor, 'xiaomi', 10);
```

## instanceof

```js
function MyInstanceOf(value, target) {
  // 排除基本数据类型
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // 非法的 target 值
  if (!target.prototype) {
    return false;
  }

  value = value.__proto__;
  while (true) {
    if (value === null) {
      return false;
    }

    if (value === target.prototype) {
      return true;
    }

    // 没找到继续向上一层原型链查找
    value = value.__proto__;
  }
}
```

## Array

### 空数组

```js
const arr = [, , , , ,]; // 有几个逗号长度就为几
```

### 手写 map/forEach

```js
Array.prototype.myMap = function (fn, thisValue) {
  if (typeof fn !== 'function') {
    throw new TypeError(`${fn} is not a function`);
  }

  const arr = Object(this); // 方法调用的数组
  let res = [];

  for (let i = 0; i < arr.length; i++) {
    res[i] = fn.call(thisValue, arr[i], i, arr);
  }

  return res;
};
```

```js
Array.prototype.myForEach = function (fn, thisValue) {
  if (typeof fn !== 'function') {
    throw new TypeError(`${fn} is not a function`);
  }

  const arr = Object(this);

  for (let i = 0; i < arr.length; i++) {
    fn.call(thisValue, arr[i], i, arr);
  }
};
```

参考 `axios` 源码 , 不仅支持数组, 还支持可迭代对象

```js
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  let i;
  let l;

  // 如果不是对象(包括 [] 和 {}), 强制转为数组
  if (typeof obj !== 'object') {
    obj = [obj];
  }

  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // 是否获取原型上的 key
    const keys = allOwnKeys
      ? Object.getOwnPropertyNames(obj)
      : Object.keys(obj);

    const len = keys.length;
    let key;

    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
```

## 继承

### 原型链继承

```js
function Parent() {
  this.type = 'component';
}

function Child() {}

Child.prototype = new Parent();

const instance = new Child();

console.log(instance.type); // component
console.log(instance.__proto__ == Child.prototype); // true

// Child 的 prototype 指向 Parent 实例
// Parent 实例的 __proto__ 指向 Parent.prototype
console.log(Child.prototype.__proto__ == Parent.prototype); // true
```

### 借用构造函数继承

```js
function Parent() {
  this.type = 'component';
}

function Child() {
  // 这里相当于 (Child实例).type = 'component';
  Parent.call(this);
}

const instance = new Child();
console.log(instance.type); // component
console.log(instance.__proto__ == Child.prototype); // true

// 不会改变原型链
console.log(Child.prototype.__proto__ == Object.prototype); // true
```

### 组合继承

```js
// 会调用两次父类构造函数, uzi 一次和 kat 一次
function Parent(name) {
  this.name = name;
}

function Child(name, age) {
  // 这时候原型上有 name 属性, 自身也存在 name 属性
  Parent.call(this, name);
  this.age = age;
}

Child.prototype = new Parent();

let uzi = new Child('Uzi', 3);
let kat = new Child('Kat', 1);

console.log(uzi.name); // Uzi
console.log(kat.name); // Kat
```

### 原型式继承

```js
// Object.create() 原理
function Object(obj) {
  function Creator() {}
  Creator.prototype = obj;
  return new Creator();
}

const parent = {
  name: 'unamed',
};

let child = Object(parent);
child.name = 'Uzi';

console.log(child.name); // Uzi
console.log(child.__proto__.name); // unamed
```

### 寄生式继承

```js
function Object(obj) {
  function Creator() {}
  Creator.prototype = obj;
  return new Creator();
}

function createAnother(original) {
  var clone = Object(original);
  clone.sayHi = function () {
    // 以某种方式来增强对象
    console.log('hi');
  };
  return clone; // 返回这个对象
}

const person = {
  name: 'unamed',
};

const child = createAnother(person);
child.sayHi(); // "hi"
```

## 静态属性

静态属性的继承是浅拷贝

```js
class A {
  static foo = {
    bar: 100,
  };

  static baz = 100;
}

class B extends A {
  constructor() {
    super();
    B.foo.bar--;
    B.baz--;
  }
}

const b = new B();

console.log(B.foo.bar); // 99
console.log(A.foo.bar); // 99

console.log(B.baz); // 99
console.log(A.baz); // 100
```

## 其他

对象属性遍历 `for...in` 会获取到原型链上的属性, 用 `hasOwnProperty` 过滤

也可以使用 `Object.keys` 遍历对象的, 且不会拿到原型链属性

`JSON.stringify` 序列化的时候遇到 `undefined` 和 `函数` 的时候都会跳过

### 判断简单对象(plain object)

```js
const isPlainObject = (val) => {
  if (kindOf(val) !== 'object') {
    return false;
  }

  // 获取变量原型
  const prototype = Object.getPrototypeOf(val);

  return (
    (prototype === null /* 原型是 null, 如 object */ ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) /* 原型的原型是 null */ &&
    !(Symbol.toStringTag in val) /* 不存在自定义类型标签 */ &&
    !(Symbol.iterator in val) /* 变量不可迭代 */
  );
};
```

### 扩展对象

```js
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(
    b /* 将 b 的属性扩展到 a 上 */,
    (val, key) => {
      /* b 有一个属性是函数并且存在自定义 this 时 */
      if (thisArg && isFunction(val)) {
        a[key] = bind(val, thisArg) /* 函数的 this 转为 thisArg */;
      } else {
        a[key] = val;
      }
    },
    { allOwnKeys /* 是否扩展原型属性 */ }
  );

  return a;
};
```

