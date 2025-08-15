/// <reference types="@nasl/types" />
namespace extensions.game_login.viewComponents {
  const { Component, Prop, ViewComponent, Slot, Method, Event, ViewComponentOptions } = nasl.ui;

  @ExtensionComponent({
    type: 'pc',
    ideusage: {
      idetype: 'element',
    }
  })
  @Component({
    title: 'pc登录',
    description: 'pc登录',
  })
  export class UserLoginPc extends ViewComponent {
    constructor(options?: Partial<UserLoginPcOptions>) {
      super();
    }
  }

  export class UserLoginPcOptions extends ViewComponentOptions {
    @Prop({
      title: '内容',
      description: '显示文本',
      setter: {
        concept: 'InputSetter'
      }
    })
    text: nasl.core.String = '';

    @Event({
      title: '点击关闭按钮',
      description: '点击关闭按钮',
    })
    onClose: (event: { index: nasl.core.Integer }) => void;

    @Event({
      title: 'urs登录成功后',
      description: 'urs登录成功后',
    })
    onSuccess: (event: { phone: nasl.core.String, email: nasl.core.String, tokenBody: { id: nasl.core.String,
       name: nasl.core.String,phone:nasl.core.String }, userInfo: { accessToken: nasl.core.String,refreshToken: nasl.core.String,registered: nasl.core.Boolean,firstLogin: nasl.core.Boolean } }) => void;
  }
}