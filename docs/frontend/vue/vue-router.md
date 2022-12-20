---
title: vue-router
---

## [RouterLink](https://router.vuejs.org/zh/api/index.html#router-link-props)

```js
const RouterLinkImpl = defineComponent({
  name: 'RouterLink',
  compatConfig: { MODE: 3 },
  props: {
    to: {
      // 目标路由
      // 可以是字符串 to="/home"
      // 也可以是对象 :to="{ path: '/home' }"
      type: [String, Object],
      required: true,
    },
    replace: Boolean, // 导航后是否留下历史记录
    activeClass: String, // 链接激活时 <a> 标签样式
    exactActiveClass: String, // 链接精准激活时 <a> 标签样式
    custom: Boolean, // 自定义 RouterLink
    ariaCurrentValue: {
      // 'page' | 'step' | 'location' | 'date' |
      // 'time' | 'true' | 'false'
      type: String,
      default: 'page',
    },
  },

  useLink,

  setup(props, { slots }) {
    const link = reactive(useLink(props));

    // 使用 inject 获取路由实例
    // 这里也可以使用 useRouter()
    const { options } = inject(routerKey);

    // 激活样式
    const elClass = computed(() => ({
      [getLinkClass(
        props.activeClass,
        options.linkActiveClass,
        'router-link-active'
      )]: link.isActive,
      [getLinkClass(
        props.exactActiveClass,
        options.linkExactActiveClass,
        'router-link-exact-active'
      )]: link.isExactActive,
    }));

    return () => {
      // 方便这样使用
      // <router-link v-slot="{ navigate, href, route }"></routrt-link>
      const children = slots.default && slots.default(link);
      
      return props.custom // 是否是自定义 RouterLink
        ? children
        : h( // 默认渲染一个 a 标签
            'a',
            {
              'aria-current': link.isExactActive
                ? props.ariaCurrentValue
                : null,
              href: link.href,
              onClick: link.navigate,
              class: elClass.value,
            },
            children
          );
    };
  },
});

export const RouterLink = RouterLinkImpl;
```

## [RouterView](https://router.vuejs.org/zh/api/index.html#router-view-props)

```js
export const RouterViewImpl = defineComponent({
  name: 'RouterView',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: 'default', // 命名视图, 仅渲染组件名与 name 相匹配的组件
    },
    route: Object,
  },

  compatConfig: { MODE: 3 },

  setup(props, { attrs, slots }) {
    // 获取当前路由
    const injectedRoute = inject(routerViewLocationKey);

    // 有自定义的 router 则使用自定义的, 否则使用当前路由
    const routeToDisplay = computed(() => props.route || injectedRoute.value);

    const injectedDepth = inject(viewDepthKey, 0);

    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;

      let matchedRoute;
      while (
        (matchedRoute = matched[initialDepth]) &&
        !matchedRoute.components
      ) {
        initialDepth++;
      }
      return initialDepth;
    });


    const matchedRouteRef = computed(
      () => routeToDisplay.value.matched[depth.value]
    ); // 匹配路由

    provide(
      viewDepthKey,
      computed(() => depth.value + 1)
    );

    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);

    const viewRef = ref();

    watch(
      () => [viewRef.value, matchedRouteRef.value, props.name],
      ([instance, to, name], [oldInstance, from]) => {
        if (to) {
          to.instances[name] = instance;
          if (from && from !== to && instance && instance === oldInstance) {
            if (!to.leaveGuards.size) {
              to.leaveGuards = from.leaveGuards;
            }

            if (!to.updateGuards.size) {
              to.updateGuards = from.updateGuards;
            }
          }
        }

        if (
          instance &&
          to &&
          (!from || !isSameRouteRecord(to, from) || !oldInstance)
        ) {
          (to.enterCallbacks[name] || []).forEach((callback) =>
            callback(instance)
          );
        }
      },
      { flush: 'post' }
    );

    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;

      const ViewComponent =
        matchedRoute && matchedRoute.components[currentName];

      if (!ViewComponent) {
        return normalizeSlot(slots.default, {
          Component: ViewComponent,
          route,
        });
      }

      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption
        ? routePropsOption === true
          ? route.params
          : typeof routePropsOption === 'function'
          ? routePropsOption(route)
          : routePropsOption
        : null;

      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };

      const component = h(
        ViewComponent,
        Object.assign({}, routeProps, attrs, {
          onVnodeUnmounted,
          ref: viewRef,
        })
      );

      return (
        normalizeSlot(slots.default, { Component: component, route }) ||
        component
      );
    };
  },
});

function normalizeSlot(slot, data) {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}

export const RouterView = RouterViewImpl;
```

## createRouter

```js
export function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);

  // 解析查询(https://router.vuejs.org/zh/api/#parsequery)
  const parseQuery = options.parseQuery || originalParseQuery;
  const stringifyQuery = options.stringifyQuery || originalStringifyQuery;

  const routerHistory = options.history; // 路由历史记录的实现方式

  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();

  // 当前路由地址
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);

  let pendingLocation = START_LOCATION_NORMALIZED;

  // 如果提供滚动行为, 则 history 设置手动滚动
  if (isBrowser && options.scrollBehavior && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const normalizeParams = applyToParams.bind(null, (paramValue) =>
    String(paramValue)
  );
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);

  // 添加一条新的路由记录作为现有路由的子路由
  function addRoute(parentOrRoute /* 父路由 */, route) {
    let parent, record;
    if (isRouteName(parentOrRoute) /* 不是 string 或 symbol */) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }

    return matcher.addRoute(record, parent);
  }

  // 通过名称删除现有路由
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }

  // 获取所有路由记录的完整列表
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }

  // 确认是否存在指定名称的路由
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }

  // 返回路径(如 /about )的标准化版本
  // => { fullPath: "/about", hash: "", ...}
  function resolve(rawLocation, currentLocation) {
    currentLocation = 
        Object.assign({}, currentLocation || currentRoute.value);

    if (typeof rawLocation === 'string') {
      const locationNormalized = parseURL(
        parseQuery,
        rawLocation,
        currentLocation.path
      );

      const matchedRoute = matcher.resolve(
        { path: locationNormalized.path },
        currentLocation
      );

      const href = routerHistory.createHref(locationNormalized.fullPath);

      return Object.assign(locationNormalized, matchedRoute, {
        params: decodeParams(matchedRoute.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: undefined,
        href,
      });
    }

    let matcherLocation;

    if ('path' in rawLocation) {
      matcherLocation = Object.assign({}, rawLocation, {
        path: parseURL(parseQuery, rawLocation.path, currentLocation.path).path,
      });
    } else {
      const targetParams = Object.assign({}, rawLocation.params);

      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }

      matcherLocation = Object.assign({}, rawLocation, {
        params: encodeParams(rawLocation.params),
      });

      currentLocation.params = encodeParams(currentLocation.params);
    }

    const matchedRoute = 
        matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || '';

    matchedRoute.params = 
        normalizeParams(decodeParams(matchedRoute.params));

    const fullPath = stringifyURL(
      stringifyQuery,
      Object.assign({}, rawLocation, {
        hash: encodeHash(hash),
        path: matchedRoute.path,
      })
    );

    const href = routerHistory.createHref(fullPath);

    return Object.assign(
      {
        fullPath,
        hash,
        query:
          stringifyQuery === originalStringifyQuery
            ? normalizeQuery(rawLocation.query)
            : rawLocation.query || {},
      },
      matchedRoute,
      {
        redirectedFrom: undefined,
        href,
      }
    );
  }

  function locationAsObject(to) {
    return typeof to === 'string'
      ? parseURL(parseQuery, to, currentRoute.value.path)
      : Object.assign({}, to);
  }

  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(ErrorTypes.NAVIGATION_CANCELLED, {
        from,
        to,
      });
    }
  }

  // 通过在历史堆栈中推送一个 entry, 以编程方式导航到一个新的 URL
  function push(to) {
    return pushWithRedirect(to);
  }

  // 通过替换历史堆栈中的当前 entry, 以编程方式导航到一个新的 URL
  function replace(to) {
    return push(Object.assign(locationAsObject(to), { replace: true }));
  }

  function handleRedirectRecord(to) {
    // matched: 与给定路由地址匹配的标准化的路由记录数组
    const lastMatched = to.matched[to.matched.length - 1];

    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation =
        typeof redirect === 'function' ? redirect(to) : redirect;

      if (typeof newTargetLocation === 'string') {
        newTargetLocation =
          newTargetLocation.includes('?') || newTargetLocation.includes('#')
            ? locationAsObject(newTargetLocation)
            : { path: newTargetLocation };
        newTargetLocation.params = {};
      }

      return Object.assign(
        {
          query: to.query,
          hash: to.hash,
          params: 'path' in newTargetLocation ? {} : to.params,
        },
        newTargetLocation
      );
    }
  }

  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = (pendingLocation = resolve(to));
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace = to.replace === true;

    const shouldRedirect = handleRedirectRecord(targetLocation);

    if (shouldRedirect)
      // 递归调用判断重定向地址是否需要继续重定向
      return pushWithRedirect(
        Object.assign(locationAsObject(shouldRedirect), {
          state:
            typeof shouldRedirect === 'object'
              ? Object.assign({}, data, shouldRedirect.state)
              : data,
          force,
          replace,
        }),
        redirectedFrom || targetLocation
      );

    const toLocation = targetLocation;

    toLocation.redirectedFrom = redirectedFrom;
    
    let failure;

    if (!force && isSameRouteLocation(stringifyQuery, from, targetLocation)) {
      failure = createRouterError(ErrorTypes.NAVIGATION_DUPLICATED, {
        to: toLocation,
        from,
      });
      handleScroll(from, from, true, false);
    }

    return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
      .catch((error) =>
        isNavigationFailure(error)
          ? isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)
            ? error
            : markAsReady(error)
          : triggerError(error, toLocation, from)
      )
      .then((failure) => {
        if (failure) {
          if (
            isNavigationFailure(failure, ErrorTypes.NAVIGATION_GUARD_REDIRECT)
          ) {
            return pushWithRedirect(
              Object.assign(
                {
                  replace,
                },
                locationAsObject(failure.to),
                {
                  state:
                    typeof failure.to === 'object'
                      ? Object.assign({}, data, failure.to.state)
                      : data,
                  force,
                }
              ),
              redirectedFrom || toLocation
            );
          }
        } else {
          failure = finalizeNavigation(toLocation, from, true, replace, data);
        }
        
        triggerAfterEach(toLocation, from, failure);
        return failure;
      });
  }

  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }

  function navigate(to, from) {
    let guards;

    const [leavingRecords, updatingRecords, enteringRecords] =
      extractChangingRecords(to, from);

    guards = extractComponentsGuards(
      leavingRecords.reverse(),
      'beforeRouteLeave',
      to,
      from
    );

    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }

    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(
      null,
      to,
      from
    );

    guards.push(canceledNavigationCheck);

    return runGuardQueue(guards)
      .then(() => {
        guards = [];
        for (const guard of beforeGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from));
        }
        guards.push(canceledNavigationCheck);

        return runGuardQueue(guards);
      })
      .then(() => {
        guards = extractComponentsGuards(
          updatingRecords,
          'beforeRouteUpdate',
          to,
          from
        );

        for (const record of updatingRecords) {
          record.updateGuards.forEach((guard) => {
            guards.push(guardToPromiseFn(guard, to, from));
          });
        }
        guards.push(canceledNavigationCheck);

        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const record of to.matched) {
          if (record.beforeEnter && !from.matched.includes(record)) {
            if (Array.isArray(record.beforeEnter)) {
              for (const beforeEnter of record.beforeEnter)
                guards.push(guardToPromiseFn(beforeEnter, to, from));
            } else {
              guards.push(guardToPromiseFn(record.beforeEnter, to, from));
            }
          }
        }
        guards.push(canceledNavigationCheck);

        return runGuardQueue(guards);
      })
      .then(() => {
        to.matched.forEach((record) => (record.enterCallbacks = {}));

        guards = extractComponentsGuards(
          enteringRecords,
          'beforeRouteEnter',
          to,
          from
        );
        guards.push(canceledNavigationCheck);

        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from));
        }
        guards.push(canceledNavigationCheck);

        return runGuardQueue(guards);
      })
      .catch((err) =>
        isNavigationFailure(err, ErrorTypes.NAVIGATION_CANCELLED)
          ? err
          : Promise.reject(err)
      );
  }

  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list()) guard(to, from, failure);
  }

  function finalizeNavigation(toLocation, from, isPush, replace, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error) return error;

    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;

    if (isPush) {
      if (replace || isFirstNavigation)
        routerHistory.replace(
          toLocation.fullPath,
          Object.assign(
            {
              scroll: isFirstNavigation && state && state.scroll,
            },
            data
          )
        );
      else routerHistory.push(toLocation.fullPath, data);
    }

    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);

    markAsReady();
  }

  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener) return;
    
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router.listening) return;

      const toLocation = resolve(to);

      // undefined | RouteLocationRaw 
      const shouldRedirect = handleRedirectRecord(toLocation);
      
      if (shouldRedirect) {
        pushWithRedirect(
          Object.assign(shouldRedirect, { replace: true }), // 重定向到哪
          toLocation // 从哪里重定向
        ).catch(() => {});
        
        return;
      }

      pendingLocation = toLocation;
      const from = currentRoute.value;

      if (isBrowser) {
        saveScrollPosition(
          getScrollKey(from.fullPath, info.delta),
          computeScrollPosition()
        );
      }

      navigate(toLocation, from)
        .catch((error) => {
          if (
            // 跳转取消或中止
            isNavigationFailure(
              error,
              ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_CANCELLED
            )
          ) {
            return error;
          }
          if (
            // 因为导航重定向
            isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)
          ) {
            pushWithRedirect(error.to, toLocation)
              .then((failure) => {
                if (
                  isNavigationFailure(
                    failure,
                    ErrorTypes.NAVIGATION_ABORTED |
                      ErrorTypes.NAVIGATION_DUPLICATED
                  ) &&
                  !info.delta &&
                  info.type === 'pop'
                ) {
                  routerHistory.go(-1, false);
                }
              })
              .catch(() => {});
            return Promise.reject();
          }

          if (info.delta) {
            routerHistory.go(-info.delta, false);
          }
          return triggerError(error, toLocation, from);
        })
        .then((failure) => {
          failure = failure || finalizeNavigation(toLocation, from, false);

          if (failure) {
            if (
              info.delta &&
              !isNavigationFailure(failure, ErrorTypes.NAVIGATION_CANCELLED)
            ) {
              routerHistory.go(-info.delta, false);
            } else if (
              info.type === 'pop' &&
              isNavigationFailure(
                failure,
                ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED
              )
            ) {
              routerHistory.go(-1, false);
            }
          }

          triggerAfterEach(toLocation, from, failure);
        })
        .catch(() => {});
    });
  }

  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;

  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorHandlers.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    }
    return Promise.reject(error);
  }

  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      readyHandlers.add([resolve, reject]);
    });
  }

  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers
        .list()
        .forEach(([resolve, reject]) => (err ? reject(err) : resolve()));
      readyHandlers.reset();
    }
    return err;
  }

  // 滚动行为
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior) return Promise.resolve();

    const scrollPosition =
      (!isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0))) ||
      ((isFirstNavigation || !isPush) &&
        history.state &&
        history.state.scroll) ||
      null;

    return nextTick()
      .then(
        () => scrollBehavior(to, from, scrollPosition) /* return { top: 0 } */
      )
      .then(
        (position /* 期望滚动到哪里 */) =>
          position && scrollToPosition(position)
      )
      .catch((err) => triggerError(err, to, from));
  }

  // 前进或后退
  const go = (delta /* number */) => routerHistory.go(delta);

  let started;
  const installedApps = new Set();

  // const router = createRouter();
  // app.use(router);
  const router = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,

    // 插件相关
    install(app) {
      const router = this;

      // 注册两个组件
      app.component('RouterLink', RouterLink);
      app.component('RouterView', RouterView);

      // 全局挂载 $router
      // const { proxy } = getCurrentInstance();
      // proxy.$router...
      app.config.globalProperties.$router = router;

      Object.defineProperty(app.config.globalProperties, '$route', {
        enumerable: true, // 可枚举的
        get: () => unref(currentRoute),
      });

      if (
        isBrowser &&
        !started && // 避免反复启动
        currentRoute.value === START_LOCATION_NORMALIZED
      ) {
        // 启动路由
        started = true;
        push(routerHistory.location).catch((err) => {
          console.warn('启动路由时出错', err);
        });
      }

      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }

      app.provide(routerKey, router); // 注入当前 router 实例
      app.provide(routeLocationKey, reactive(reactiveRoute)); // 注入当前路由地址
      app.provide(routerViewLocationKey, currentRoute);

      const unmountApp = app.unmount;

      // 保存所有使用该路由的实例
      installedApps.add(app);

      app.unmount = function () {
        installedApps.delete(app);

        // 最后一个用到该路由的组件被卸载时, 恢复默认
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          // 清理监听器
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }

        unmountApp();
      };
    },
  };

  return router;
}
```