import Component from '../index';

export default {
  id: 'user-logi-h-5-blocks',
  title: '组件列表/UserLogiH5/内置区块',
  component: Component,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
};

export const Default = {
  name: '基本用法',
  render: () => ({
    template: '<user-logi-h-5></user-logi-h-5>',
  }),
};
