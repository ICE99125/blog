---
title: 布局
---

## 元素隐藏

```css
/* 隐藏但会占据原布局, 不会触发点击事件 */
.hidden {
  visibility: hidden;
}
```

```css
/* 隐藏且不会占据原布局 */
.hidden {
  display: none;
}
```

```css
/* 隐藏但会占据原布局, 且会触发点击事件 */
.hidden {
  opacity: 0;
  /* 可以取消点击事件 */
  pointer-events: none;
}
```

## 居中

### 文本居中

```css{5}
.text {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
}
```

### 绝对定位居中

```css{5,6}
.calc {
  position: absolute;
  width: 20px;
  height: 20px;
  left: calc((100% - 20px) / 2);
  top: calc((100% - 20px) / 2);
}
```

```css{7}
.calc {
  position: absolute;
  width: 20px;
  height: 20px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

```css{9}
.calc {
  position: absolute;
  width: 20px;
  height: 20px;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

### flex 布局

```css
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

* table

:::tip
vertical-align 只对行内元素(如span)、行内块元素和表格单元格元素
:::

```css{2}
.table {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  width: 20px;
  height: 20px;
}
```

## BFC

块级格式化上下文、独立的渲染区域、不会影响边界以外的元素

### 形成条件

- `float` 设置成 `left` 或 `right`
- `position` 设置成 `absolute` 或者 `fixed`
- `overflow` 不是 `visible`
- `display` 是 `flex` 或者 `inline-block`

## 浮动

- 只有横向浮动, 并没有纵向浮动

- 当元素应用了 float 属性后, 将会脱离普通流

- 行内元素与浮动元素重叠, 其边框, 背景和内容都会显示在浮动元素之 `上`

- 块级元素与浮动元素重叠, 边框和背景会显示在浮动元素之 `下`, 内容会显示在浮动元素之 `上`

浮动能使块级元素相互挨着, 在一行显示

```html
<div class="parent">
  <div class="one"></div>
  <div class="two"></div>
</div>
```

```css
.parent {
  background-color: aquamarine;
}

.one,
.two {
  float: left;
  background-color: wheat;
  width: 100px;
  height: 100px;
}
```

:::tip
display: inline-block 也能实现这种效果, 但是两个块级元素之间存在间隙
:::

子元素使用了浮动后父元素高度变为 `0` , 进而影响布局

解决办法

```css{4}
.parent::after {
  content: '';
  display: block;
  clear: both;
}
```

## 三栏布局

```html
<div class="parent">
  <div class="one"></div>
  <div class="two"></div>
  <div class="three"></div>
</div>
```

### flex

```css{13}
.parent {
  display: flex;
}

.one,
.three {
  width: 300px;
  height: 100px;
  background-color: antiquewhite;
}

.two {
  flex: 1;
  height: 100px;
  background-color: aquamarine;
}
```

### grid

```css{3}
.parent {
  display: grid;
  grid-template-columns: 300px auto 300px;
  grid-template-rows: 100px;
}

.one,
.three {
  background-color: antiquewhite;
}

.two {
  background-color: aquamarine;
}
```

### table

```css{2,10,15}
.parent {
  display: table;
  width: 100%;
  height: 100px;
}

.one,
.three {
  width: 300px;
  display: table-cell;
  background-color: antiquewhite;
}

.two {
  display: table-cell;
  background-color: aquamarine;
}
```

### float

```html{3}
<div class="parent">
  <div class="one"></div>
  <div class="three"></div>
  <div class="two"></div>
</div>
```

```css{24}
.parent::after {
  content: '';
  display: block;
  clear: both;
}

.one,
.three {
  width: 300px;
  height: 100px;
  background-color: antiquewhite;
}

.one {
  float: left;
}

.three {
  float: right;
}

.two {
  height: 100px;
  overflow: hidden;
  background-color: aquamarine;
}
```