// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  learning: [
    {
      type: 'doc',
      id: 'learning/intro',
      label: '简介',
    },
    {
      type: 'category',
      label: '计算机网络',
      items: [
        'learning/internet/application',
        'learning/internet/link',
        'learning/internet/network',
        'learning/internet/physical',
        'learning/internet/transport',
      ],
    },
    {
      type: 'category',
      label: '操作系统',
      items: [
        'learning/system/process',
        'learning/system/file',
        'learning/system/io',
        'learning/system/memory',
      ],
    },
    {
      type: 'category',
      label: '计算机组成原理',
      items: [
        'learning/principles/summary',
        'learning/principles/operate',
        'learning/principles/memory',
        'learning/principles/bus',
        'learning/principles/cpu',
        'learning/principles/instruction',
        'learning/principles/io',
      ],
    },
    {
      type: 'link',
      label: '数据结构',
      href: 'https://juejin.cn/column/7070003749472698399',
    },
  ],
  frontend: [
    {
      type: 'category',
      label: 'javascript',
      items: [
        'frontend/javascript/advanced',
        'frontend/javascript/object',
        'frontend/javascript/output',
        'frontend/javascript/promise',
        'frontend/javascript/this',
        'frontend/javascript/webpack',
        'frontend/javascript/other',
      ],
    },
    {
      type: 'category',
      label: 'css',
      items: [
        'frontend/css/attribute',
        'frontend/css/layout',
        'frontend/css/useful',
      ],
    },
    {
      type: 'category',
      label: 'vue',
      items: [
        'frontend/vue/vue-router',
        'frontend/vue/vue',
        'frontend/vue/pinia',
      ],
    },
    {
      type: 'doc',
      id: 'frontend/html',
      label: 'html',
    },
    {
      type: 'doc',
      id: 'frontend/nestjs',
      label: 'nestjs',
    },
    {
      type: 'doc',
      id: 'frontend/axios',
      label: 'axios',
    },
    {
      type: 'doc',
      id: 'frontend/browser',
      label: 'brower',
    },
    {
      type: 'doc',
      id: 'frontend/performance',
      label: 'performance',
    },
  ],
};

module.exports = sidebars;

