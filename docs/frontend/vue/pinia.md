---
title: pinia
---

## createPinia

```js
const piniaSymbol = Symbol('pinia'); // 使用 symbol 唯一标识 pinia

let activePinia = undefined;
const setActivePinia = (pinia) => (activePinia = pinia);

export function createPinia() {
  const scope = effectScope(true/* 创建一个独立的 effect 作用域 */);

  // 收集一个对象的依赖, 将来存储所有 store 的 state
  const state = scope.run(() => ref({}));

  let _p = []; // 缓存插件

  // 将一个对象标记为不可被代理
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);

      pinia._a = app;
      app.provide(piniaSymbol, pinia); // 不同的组件可以有不同的 pinia
      app.config.globalProperties.$pinia = pinia;
    },

    use(plugin) {
      // const pinia = createPinia();
      // pinia.use(...); 
      _p.push(plugin);
      return this; // 链式调用
    },

    _p,
    _a: null,
    _e: scope,
    _s: new Map(), // 存储每一个 store 的映射
    state,
  });

  return pinia;
}
```

## defineStore

```js
const getActivePinia = () =>
  (getCurrentInstance() && inject(piniaSymbol)) || activePinia;

export function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options; // state | actions | getter

  const isSetupStore = typeof setup === 'function';

  // 获取配置, 第一个参数可以是 id, 也可以全部配置都写在一个对象中
  if (typeof idOrOptions === 'string') {
    id = idOrOptions;
    // 如果 setup 是函数则使用第三个参数
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }

  function useStore() {
    let pinia = getActivePinia(); // 通过 inject 获取当前组件的 pinia

    if (pinia) setActivePinia(pinia);

    pinia = activePinia;

    if (!pinia._s.has(id)) {
      // 未定义过 store 则新增 => 在调用 useStore 前不会实例化 store
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);

    return store;
  }

  useStore.$id = id;

  return useStore;
}
```

## createOptionsStore

```js
function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  // 第一次初始化时为 undefined
  const initialState = pinia.state.value[id];

  let store;

  function setup() {
    if (!initialState) {
      // 要求 state 是一个函数
      pinia.state.value[id] = state ? state() : {};
    }

    // 使用 toRefs 展开, 每个属性都是一个 ref
    const localState = toRefs(pinia.state.value[id]);

    return Object.assign(
      localState,
      // 将 actions 对象与 state 对象合并
      // actions 内方法使用 this 可访问 state 里的属性
      actions, 
      Object.keys(getters || {}).reduce((computedGetters, name) => {
        // 将 getter 变成 computed
        computedGetters[name] = markRaw(
          computed(() => {
            setActivePinia(pinia);
            const store = pinia._s.get(id);

            // getter: {
            //   doubleCount: (store) => store.counter * 2,
            // }
            // 使 this 指向 store, 并传入一个参数
            return getters[name].call(store, store);
          })
        );
        return computedGetters;
      }, {})
    );
  }

  store = createSetupStore(id, setup, options, pinia, true);

  // 状态重置, 使用新的 state 覆盖旧的 $state
  // const store = useStore();
  // store.$reset();
  store.$reset = function $reset() {
    const newState = state ? state() : {};

    // 这里 this 指向 store
    this.$patch(($state) => {
      Object.assign($state, newState);
    });
  };

  return store;
}
```

## createSetupStore

```js
function createSetupStore($id, setup, options, pinia, isOptionsStore) {
  let scope;

  const optionsForPlugin = Object.assign({ actions: {} }, options);

  const $subscribeOptions = {
    deep: true, // 深度监听, $subscribe 监听器选项
  };

  let isListening;
  let isSyncListening;
  let subscriptions = markRaw([]);
  let actionSubscriptions = markRaw([]);

  const initialState = pinia.state.value[$id];

  let activeListener;

  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;

    if (typeof partialStateOrMutator === 'function') {
      // $patch 接收一个函数
      // store.$patch((state) => {
      //   state.items.push({ name: 'shoes', quantity: 1 })
      //   state.hasChanged = true
      // })
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: 'patch function',
        storeId: $id,
      };
    } else {
      // store.$patch({
      //   counter: store.counter + 1,
      //   name: 'Abalam',
      // })
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: 'patch object',
        // 传入 $patch 的对象, 作为 $subscribe 里 mutation 的 payload
        payload: partialStateOrMutator,
        storeId: $id,
      };
    }

    const myListenerId = (activeListener = Symbol());

    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });

    isSyncListening = true;

    // 对 state 进行修改后触发监听事件
    triggerSubscriptions(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[$id]
    );
  }

  const $reset = () => {};

  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }

  function wrapAction(name, action) {
    return function () {
      setActivePinia(pinia);
      const args = Array.from(arguments);

      const afterCallbackList = [];
      const onErrorCallbackList = [];
      
      function after(callback) {
        afterCallbackList.push(callback);
      }
      
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }

      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError,
      });

      let ret;
      try {
        ret = action.apply(store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }

      if (ret instanceof Promise) {
        return ret
          .then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          })
          .catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
      }

      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }

  const partialStore = {
    _p: pinia,
    $id,
    $patch,
    $reset,
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached, // 卸载组件后是否保留
        () => stopWatcher()
      );

      const stopWatcher = scope.run(() =>
        watch(
          () => pinia.state.value[$id],
          (state) => {
            if (options.flush === 'sync' ? isSyncListening : isListening) {
              callback(
                {
                  storeId: $id,
                  type,
                }, // mutation
                state
              );
            }
          },
          assign({}, $subscribeOptions, options)
        )
      );

      return removeSubscription;
    },
    $dispose,
  };

  const store = reactive(partialStore);

  pinia._s.set($id, store); // 将 store 存入 Map 中

  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    return scope.run(() => setup() /* state, getter, actions */);
  });

  for (const key in setupStore) {
    const prop = setupStore[key];

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }

        pinia.state.value[$id][key] = prop;
      }
    } else if (typeof prop === 'function') {
      const actionValue = wrapAction(key, prop);
      setupStore[key] = actionValue;
      optionsForPlugin.actions[key] = prop;
    }
  }

  // 把 actions, getter, state 挂载到 store 上
  Object.assign(store, setupStore);
  Object.assign(toRaw(store), setupStore);

  // 把 state 挂载到 store 上, 属性名为 $state
  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        Object.assign($state, state);
      });
    },
  });

  console.log(pinia)

  // 插件相关
  pinia._p.forEach((extender) => {
    Object.assign(
      store,
      scope.run(() =>
        extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin,
        })
      )
    );
  });

  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }

  isListening = true;
  isSyncListening = true;

  return store;
}
```

## $subscribe

```js
// src/subscriptions.ts
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
```

```js
function addSubscription(
  subscriptions,
  callback,
  detached,
  onCleanup = () => {}
) {
  subscriptions.push(callback);

  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };

  if (!detached && getCurrentInstance()) {
    // 如果组件卸载不需要保留
    onUnmounted(removeSubscription);
  }

  return removeSubscription;
}
```

```js
function $subscribe(callback, options = {}) {
  const removeSubscription = addSubscription(
    subscriptions,
    callback,
    options.detached, // 卸载组件后是否保留
    () => stopWatcher()
  );

  const stopWatcher = scope.run(() =>
    watch( // 使用 vue 的 watch 实现, 当 state 变化时触发
      () => pinia.state.value[$id],
      (state) => {
        if (options.flush === 'sync' ? isSyncListening : isListening) {
          callback(
            {
              storeId: $id,
              type,
            }, // mutation
            state
          );
        }
      },
      assign({}, $subscribeOptions, options)
    )
  );

  return removeSubscription;
},
```

```js
function $patch(partialStateOrMutator) {
  // 其他代码...

  // 对 state 进行修改后触发监听事件
  triggerSubscriptions(
    subscriptions,
    subscriptionMutation,
    pinia.state.value[$id]
  );
}
```