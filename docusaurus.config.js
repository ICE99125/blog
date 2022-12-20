// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ARCTURUS',
  tagline: '( ° ▽、° ) 欢迎光临',
  url: 'https://arcturus-blog.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'logo.svg',
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ICE99125/blog/tree/main',
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/ICE99125/blog/tree/main',
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content: 'javascript, blog, notes, python',
        },
      ],
      algolia: {
        appId: 'TAP8NHZ32K',
        apiKey: '8d98d923befcf67aef61829752569b92',
        indexName: 'BLOG',
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      navbar: {
        title: 'ARCTURUS',
        logo: {
          alt: 'Logo',
          src: 'logo.svg',
        },
        items: [
          {
            to: 'docs/learning/intro',
            position: 'left',
            label: '学习笔记',
          },
          {
            to: 'docs/frontend/html',
            activeBasePath: 'docs/frontend/',
            position: 'left',
            label: '前端知识',
          },
          {
            to: 'blog/2022/intro',
            label: '博客',
            position: 'left',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '联系方式',
            items: [
              {
                label: 'Telegram',
                href: 'https://t.me/+OwZSySXhfiZiYzY1',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ICE99125',
              },
              {
                label: 'Email',
                href: 'mailto:1638330246@qq.com',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ICE99125',
              },
              {
                label: 'Yuque',
                href: 'https://www.yuque.com/arcturus',
              },
              {
                label: 'Juejin',
                href: 'https://juejin.cn/user/1997142635849566',
              },
            ],
          },
          {
            title: '前端框架',
            items: [
              {
                label: 'vue',
                href: 'https://cn.vuejs.org/',
              },
              {
                label: 'react',
                href: 'https://react.docschina.org/',
              },
            ],
          },
          {
            title: '喜欢的组件库',
            items: [
              {
                label: 'ant-design',
                href: 'https://ant.design/index-cn',
              },
              {
                label: 'vuetify',
                href: 'https://next.vuetifyjs.com/',
              },
              {
                label: 'quasar',
                href: 'http://www.quasarchs.com/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ARCTURUS, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
