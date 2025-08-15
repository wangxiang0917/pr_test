import userService from '../service/user';

export default {
  /**
   * 安装插件
   * @param {Vue} Vue - Vue构造函数
   */
  install(Vue) {
    // 将userService挂载到Vue原型
    Vue.prototype.$userService = userService;
    
    // 提供全局访问
    Vue.userService = userService;
  }
};