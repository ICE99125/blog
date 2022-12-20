---
title: webpack
---

## loader 和 plugin 的区别

`loader` 是对文件进行操作, 如将 `.scss` 转换成 `.css`

`plugin` 是一个扩展器, 针对 `loader` 后的整个打包过程, 在对应的事件节点执行自定义事件, 如打包优化, 代码压缩等

## 手写 plugin

``` js
const reg_share = /(?<type>^\#+)(\s(?<content>.*))*/;
const reg_ul = /(?<type>^\-)(\s(?<content>.*))*/;
const reg_mark = /^(.+)\s/;

function compilerHtml(_md_arr) {
  const _html_pool = {};
  let _last = '';

  for (let i = 0; i < _md_arr.length; i++) {
    const fragment = _md_arr[i];

    const matched = fragment.match(reg_mark);

    if (matched !== null) {
      // 匹配 #
      const share = reg_share.exec(fragment);
      if (share) {
        const {
          groups: { type, content },
        } = share;

        const tag = `h${type.length}`;

        if (_last === type) {
          _html_pool[tag].tags.push(`<${tag}>${content}</${tag}>`);
        } else {
          _last = type;

          _html_pool[tag] = {
            type: 'single',
            tags: [`<${tag}>${content}</${tag}>`],
          };
        }

        continue;
      }

      const ul = reg_ul.exec(fragment);

      if (ul) {
        const {
          groups: { type, content },
        } = ul;

        const tag = 'ul';

        if (_last === type) {
          _html_pool[tag].tags.push(`<li>${content}</li>`);
        } else {
          _last = type;

          _html_pool[tag] = {
            type: 'wrap', // 外层需要包裹
            tags: [`<li>${content}</li>`],
          };
        }

        continue;
      }
    }
  }

  let res = '';
  for (let key in _html_pool) {
    if (_html_pool[key].type === 'single') {
      _html_pool[key].tags.forEach((el) => {
        res += `${el}\n`;
      });
    } else if (_html_pool[key].type === 'wrap') {
      const w = key;
      res += `<${w}>\n`;

      _html_pool[key].tags.forEach((el) => {
        res += `${el}\n`;
      });

      res += `</${w}>\n`;
    }
  }

  return res;
}

module.exports = compilerHtml;
```

``` js
const { readFileSync } = require('fs');
const { resolve } = require('path');
const compilerHtml = require('./compilerHtml');

const INNER_MARK = '<!-- inner -->';

class MdToHTMLPlugin {
  constructor({ template, fileName }) {
    if (!template) throw Error('配置项 "template" 缺失.');

    this.template = template;
    this.fileName = fileName ?? 'md.html';
  }

  // 固定的方法
  apply(compiler) {
    compiler.hooks.emit.tap('MdToHTMLPlugin', (compilation) => {
      const _assets = compilation.assets;

      // 获取 markdown 文本
      const _md = readFileSync(this.template, 'utf8');
      const _md_arr = _md.split('\n');

      // 获取 html 模板
      const _template = readFileSync(
        resolve(__dirname, 'template.html'),
        'utf8'
      );

      // 将 html 模板的标识替换成解析的 html
      const _html = _template.replace(INNER_MARK, compilerHtml(_md_arr));

      _assets[this.fileName] = {
        source() {
          return _html;
        },
        size() {
          return _html.length;
        },
      };
    });
  }
}

module.exports = MdToHTMLPlugin;
```

## source map

将编译、打包、压缩后的代码映射回源代码

### 线上环境

1. `hidden-source-map` : 借助第三方错误监控平台 Sentry 使用

2. `nosources-source-map` : 只会显示 `具体行数` 以及查看源代码的错误栈

3. `sourcemap` : 通过 `nginx` 设置将 `.map` 文件只对 `白名单` 开放(公司内网)