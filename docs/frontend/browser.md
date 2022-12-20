# 浏览器

## 标签页通信

```html
<body>
    <button onclick="click_()">点击</button>
    <div id="count"></div>
    <script>
      let count = 0;

      function click_() {
        window.localStorage.setItem('count', count++);
      }

      window.addEventListener('storage', function (evt) {
        const { key, newValue } = evt;

        if (key === 'count') {
          const c = document.getElementById('count');
          c.innerHTML = newValue;
        }
      });
    </script>
</body>
```