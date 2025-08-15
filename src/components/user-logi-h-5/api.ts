/// <reference types="@nasl/types" />
namespace extensions.game_login.viewComponents {
  const { Component, Prop, ViewComponent, Slot, Method, Event, ViewComponentOptions } = nasl.ui;

  @ExtensionComponent({
    type: 'h5',
    ideusage: {
      idetype: 'element',
    }
  })
  @Component({
    title: '用户登录',
    description: '用户登录',
  })
  export class UserLogiH5 extends ViewComponent {
    constructor(options?: Partial<UserLogiH5Options>) {
      super();
    }
  }

  export class UserLogiH5Options extends ViewComponentOptions {
     @Prop({
      title: '内容',
      description: '显示文本',
      setter: {
        concept: 'InputSetter'
      }
    })
    text: nasl.core.String = '';
  }
}