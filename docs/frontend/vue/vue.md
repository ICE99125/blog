---
title: vue
---

## v-text/v-html

`v-text` 只当作字符串来看, 而 `v-html` 会解析 html

## provide/inject

``` js {13}
// runtime-core/src/component.ts
// 生成一个组件实例
export function createComponentInstance(vnode, parent, suspense) {
  // ...
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    // ...
    // 如果父组件存在则使用父组件的 provider, 否则使用 app 的
    provides: parent ? parent.provides : Object.create(appContext.provides),
  };
}
```

``` js
// runtime-core/src/apiInject.ts
// 给当前组件创建一个自己的 provide
export function provide(key, value) {
  // 获取当前组件实例(这里只是模拟, 源码中是直接导入 instance 变量)
  const currentInstance = getCurrentInstance();

  if (currentInstance) {
    // 获取当前组件实例上 provides 属性
    let { provides } = currentInstance;
    // 获取当前父级组件的 provides 属性
    const parentProvides = currentInstance.parent?.provides;
    // 如果当前的 provides 和父级的 provides 相同
    // 则说明该组件还没有自己独立的 provide
    if (provides === parentProvides) {
      // 创建一个新的 provide, 并将父组件的 provide 作为其原型
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}
```

``` js
// 通过原型链实现向上查找
export function inject(key, defaultValue, treatDefaultAsFactory = false) {
  // 获取当前组件实例对象
  const instance = getCurrentInstance();

  if (instance) {
    const provides =
      instance.parent == null // 当前组件位于根目录
        ? // 使用 app 的 provide
          instance.vnode.appContext && instance.vnode.appContext.provides
        : instance.parent.provides; // 使用父组件的 provide

    if (provides && key in provides) {
      // 如果当前组件的 provide 有就直接返回
      // 没有就会到其原型上找
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(instance.proxy)
        : defaultValue;
    }
  }
}
```

## nextTick

``` js
// runtime-core/src/scheduler.ts
const resolvedPromise = Promise.resolve(); // 微任务创建器
let currentFlushPromise = null; // 当前任务

export function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(fn) : p;
}
```