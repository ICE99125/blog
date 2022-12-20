# 前端性能优化

## 静态资源优化

1. 合并 `css` `js` 文件

2. 制作雪碧图, 减少网络请求的次数

3. 静态资源 `cdn` 分发

4. 缓存, 减少渲染的次数

## 页面渲染

1. css 放在`顶部` , 优先渲染, js 放在 `底部` , 避免阻塞

2. 减少 dom 元素个数

3. img 标签要设置高宽, 减少重绘重排

4. 虚拟长列表渲染

5. 懒加载, 避免页面打开时加载过多的资源

6. 事件委托

- `relow(回流)` 重新计算页面的布局

  - 调整窗口大小

  - 改变字体大小

  - 操作 class, style 改变尺寸和布局

  - display: none

  - 操作 dom

- `repain(重绘)` 元素的外观、风格改变, 但不改变布局

  - color

  - visibility

  - background

  - box-shadow

  - border-style, border-radius

  - outline

### 避免重绘和回流

- 尽量少访问 dom 和 css

- 减少不必要的 dom 层级

- 最好直接改变元素, 不要通过改变父元素影响子元素

- 尽量使用 class 少用 style 直接操作

- 尽量使用 `transform` 做形变和位移

- 尽可能给有动画的元素使用 `absolute` 或 `fixed`

- 尽量不使用复杂的后代选择器

- 不要使用 `table` , 一个元素改变会导致全部重绘

## 事件委托

```html
<body>
  <div id="parent">
    <div>A</div>
    <div>B</div>
  </div>
  <script>
    const parent = document.getElementById('parent');
    parent.addEventListener('click', (event) => {
      console.log(event.target); // 触发事件的对象
    });
  </script>
</body>
```

## 单页应用

### 优点

1. 良好的交互体验

2. 减轻服务器压力

### 缺点

1. `SEO` 难度较高

2. 首屏加载耗时多

3. 前进后退功能
