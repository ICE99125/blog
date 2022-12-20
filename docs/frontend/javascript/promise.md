---
title: promise
---

## all

只要有一个执行出错就退出

```js
function all(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      // 仅接收数组
      reject(new TypeError(`${typeof promises} is not a iterable`));
    }

    const result = [];
    let len = promises.length;

    if (len === 0) {
      return resolve([]); // 全部成功执行也退出
    }

    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then((res) => {
          result.push(res); // 收集每个 promise 的返回值

          if (--len === 0) {
            resolve(result);
          }
        })
        .catch(reject); // 只要有失败的就退出循环
    });
  });
}                
```

## allSettled

全部都会执行, 返回每个 promise 执行状态

```js
function allSettled(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError(`${typeof promises} is not a iterable`));
    }

    const result = [];
    let len = promises.length;

    if (len === 0) {
      return resolve([]);
    }

    // 无论每个 promise 失败还是成功, 最终都 resolve(result)
    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then((res) => {
          result.push({
            status: 'fulfilled', // 状态
            value: res, // 每个 promise 的结果
          });

          if (--len === 0) {
            resolve(result);
          }
        })
        .catch((err) => {
          result.push({
            status: 'rejected',
            reason: err,
          });

          if (--len === 0) {
            resolve(result);
          }
        });
    });
  });
}
```


## any

只要有一个成功就全部成功, 全部失败才返回失败

```js
function any(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      throw new TypeError(`${typeof promises} is not a iterable`);
    }

    let result = []; // 用于收集所有 reject
    let len = promises.length;

    if (len === 0) {
      return reject(new AggregateError('All promises were rejected'));
    }

    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then((res) => {
          resolve(res); // 有一个成功就返回
        })
        .catch((err) => {
          result.push(err);

          if (--len === 0) { // 当全部失败则返回失败结果
            reject(new AggregateError(result));
          }
        });
    });
  });
}
```

## Promise

```js
class MyPromise {
  // 三种状态
  static PADDING = 'pending';
  static FULFILLED = 'fullfilled';
  static REJECTED = 'rejected';

  constructor(func /* promise 接受的回调 */) {
    this.result = null; // resolve() 和 reject() 的参数
    this.status = MyPromise.PADDING; // 初始状态

    this.resolveCallBack = [];
    this.rejectCallBack = [];

    try {
      // 执行回调 => new MyPromise((resolve, reject) => { ... })
      // 这里也说明了 promise 的回调函数是同步的
      func(this.resolve, this.reject);
    } catch (e) {
      // new MyPromise((resolve, reject) => {
      //   throw new Error();
      // });
      this.reject(e); // 回调中存在错误则自动 reject
    }
  }

  resolve = (result) => {
    setTimeout(() => { // 模拟 resolve 的异步操作
      if (this.status === MyPromise.PADDING) {
        this.status = MyPromise.FULFILLED; // 状态改为成功
        this.result = result; // 把结果赋值给 result

        // 将 then 的回调执行
        this.resolveCallBack.forEach((callBack) => callBack());
      }
    });
  };

  reject = (result) => {
    setTimeout(() => {
      if (this.status === MyPromise.PADDING) {
        this.status = MyPromise.REJECTED; // 状态改为失败
        this.result = result;
        this.rejectCallBack.forEach((callBack) => callBack());
      }
    });
  };

  then(onFULFILLED, onREJECTED) {
    // 原生 Promise 的 then 接收两个函数, 并返回新的 Promise 实现链式调用

    // 判断 then 的两个参数是否是函数, 不是就转成函数
    // 如果第一个参数不是函数(null/undefined), 则把结果直接返回
    // 将会被下一个 then 捕获
    // 如果第二个参数不是函数, 则抛出错误, 被下一个 catch 捕获
    onFULFILLED =
      typeof onFULFILLED === 'function' ? onFULFILLED : (res) => res;
    onREJECTED =
      typeof onREJECTED === 'function'
        ? onREJECTED
        : (err) => {
            throw err;
          };

    const p = new MyPromise((resolve, reject) => {
      if (this.status === MyPromise.PADDING) {
        // 如果当前是待定状态(没有调用 resolve 或 reject)
        // 则把 then 的参数所代表的函数保存起来
        this.resolveCallBack.push(() => {
          try {
            // 如果 then 的第一个参数为 null/undefined
            // 这里就相当于 const x = this.result;
            const x = onFULFILLED(this.result);
            this.resolvePromise(p, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

        this.rejectCallBack.push(() => {
          try {
            // 如果 then 的第二个参数为 null/undefined
            // 这里 try/catch 会捕获 throw err
            // 因此走下面的 reject(e) => 这里的 reject 是 p 的
            // 即被下一个 MyPromise 的 then 或 catch 捕获
            const x = onREJECTED(this.result);
            this.resolvePromise(p, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (this.status === MyPromise.FULFILLED) {
        try {
          const x = onFULFILLED(this.result);
          this.resolvePromise(p, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      } else if (this.status === MyPromise.REJECTED) {
        try {
          const x = onREJECTED(this.result);
          this.resolvePromise(p, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }
    });

    return p;
  }

  catch(onREJECTED) {
    return this.then(null, onREJECTED);
  }

  resolvePromise(promise, x, resolve, reject) {
    if (x === promise) {
      return reject(new TypeError('Chaining cycle delected for promise'));
    }

    let called; // 防止多次调用
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        let then = x.then;

        if (typeof then === 'function') {
          then.call(
            x,
            (_) => {
              if (called) return;
              called = true;
              // 如果 x 是 Promise 还要继续调用 resolvePromise
              this.resolvePromise(promise, x, resolve, reject);
            },
            (err) => {
              if (called) return;
              called = true;
              reject(err);
            }
          );
        }
      } catch (e) {
        if (called) return;
        called = true;

        // 如果 let then = x.then 出错, 返回错误信息
        // 即 x 对象不存在 then 方法
        reject(e);
      }
    } else {
      // 如果 then 返回的是一个字符串, 则直接调用 resolve
      resolve(x);
    }
  }
}
```

## race

谁状态先改变, 无论是 `fulfilled` 还是 `rejected`, 就返回谁的结果

```js
function race(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      Promise.resolve(promise).then(resolve).catch(reject);
    });
  });
}
```

## reject

```js
function reject(value) {
  return new Promise((_, reject) => {
    reject(value);
  });
}
```

## resolve

```js
function resolve(value) {
  // 是 Promise 实例直接返回
  if (value && typeof value === 'object' && value instanceof Promise) {
    return value;
  }

  // 否则创建实例
  return new Promise(resolve => {
    resolve(value);
  });
}
```

## await/async

await/async 函数写法

```js
function getData() {
  return new Promise((resolve) => setTimeout(() => resolve('data'), 1000));
}

async function test() {
  const data = await getData();
  console.log(`data: ${data}`);
  const data2 = await getData();
  console.log(`data2: ${data2}`);
  return 'success';
}

test().then((res) => console.log(res));
```

使用生成器时需要自己实现执行器

```js
function getData() {
  return new Promise((resolve) => setTimeout(() => resolve('data'), 1000));
}

function* test_() {
  const data = yield getData();
  console.log(`data: ${data}`);
  const data2 = yield getData();
  console.log(`data2: ${data2}`);
  return 'success';
}

// 需要手动执行
// const t = test_();
// const _ = t.next();

// { value: Promise { <pending> }, done: false }
// console.log(_);

// _.value.then((val) => {
//   // 把第一个 yield 的值传入 next, 进而赋值给 data
//   const __ = t.next(val); 

//   __.value.then((val) => {
//     t.next(val);
//   });
// });

const test = asyncToGenerator(test_); // 手写自动执行器

test().then((res) => console.log(res));
```

```js
function asyncToGenerator(generatorFunc) {
  // 返回一个新的函数
  return function (...args) {
    // 先调用 generator 函数生成迭代器
    // 对应 const gen = test_();
    const gen = generatorFunc.apply(this, args);

    // 返回一个 promise 
    // 因为外部是用 .then 的方式
    // const test = asyncToGenerator(test_)
    // test().then(res => console.log(res))

    return new Promise((resolve, reject) => {
      // 内部定义一个 step 函数, 用来一步一步的跨过 yield 的阻碍
      // key 有 next 和 throw 两种取值
      // 分别对应了 gen 的 next 和 throw 方法
      // arg 参数则是用来把 promise resolve 出来的值交给下一个 yield
      function step(key, arg) {
        let genResult;

        try {
          genResult = gen[key](arg); // 相当于 gen.next(arg);
        } catch (error) {
          // 执行出错后直接 reject, 由 catch 接收
          return reject(error);
        }

        // gen.next() 得到的结果是一个 { value, done } 的结构
        // 这个 value 是一个 promise
        const { value, done } = genResult;

        if (done) {
          // 只有生成器调用最后一次 next 后 done 才会 true
          // 即最后一个 yield 或 return 后
          return resolve(value);
        } else {
          return Promise.resolve(value).then((val){
              step('next', val);
            }, (err) {
              step('throw', err);
            }
          );
        }
      }

      step('next');
    });
  };
}
```