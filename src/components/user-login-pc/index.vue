<template>
  <div>
    <template v-if="corpLogin">
      <div class="app-login">
        <div class="login-popup" :style="{ minWidth: '576px', backgroundSize: '100%' }">
          <div class="login-popup__close" @click="closeLogin" />
          <div class="login-popup__logo">
            <img :src="logoUrl" alt="Logo" />
          </div>
          <!-- URS SDK 挂载容器 -->
          <div id="urs-container" />
          <!-- <div class="login-popup__types">
            <a href="javascript:;" @click.prevent="openCorpLogin">
              <img :src="corpLogoUrl" alt="Corp Login" />
              <span>corp 邮箱登录</span>
            </a>
          </div> -->
          <p class="login-popup__agreement" />
        </div>
      </div>

      <!-- <button @click="login">登录</button> -->
    </template>
    <template v-if="!corpLogin">
      <!-- <CorpLoginSection @login-success="closeLogin" /> -->
    </template>
  </div>
</template>

<script>
import { AppURS } from './utils/app_urs.js'
// 如果你有 getPublicAsset、useBodyScrollable 等工具，也可以 import 进来
import logoUrl from './images/login/logo@2x.png'
import corpLogoUrl from './images/login/corp.png'
// import CorpLoginSection from './CorpLoginSection.vue'
import loginService from './server.js'

export default {
  name: 'AppLogin',
  data() {
    return {
      isLogin: false,  // 示例登录状态，按需替换为 Vuex state
      logoUrl,
      corpLogoUrl,
      corpLogin: true
    }
  },
  components: {
    // CorpLoginSection,

  },
  methods: {

    closeLogin() {
      console.log('closeLogin')
      this.$emit('close', {});
    },
    // 打开企业邮箱登录
    openCorpLogin() {
      this.corpLogin = false
      console.log('打开 Corp 邮箱登录')
    },

    // 登录成功回调
    async login(data) {
      console.log('login -> ', data)
      // 1. 构造参数
      const loginParams = {}
      let phone = ''
      let email = ''
      if (data.includes('@')) {
        loginParams.inputMail = data
        email = data
      } else {
        loginParams.inputPhone = data
        phone = data
      }

      try {
        // 2. 等待登录接口返回
        const tokenBody = await loginService.login(loginParams)
        // 3. 登录成功后，等待获取用户信息
        const userInfo = await loginService.getUserInfo()
        // 4. 统一派发事件
        this.$emit('success', {
          phone,
          email,
          tokenBody: tokenBody,
          userInfo: userInfo
        })
      } catch (error) {
        console.error('登录或获取用户信息失败', error.message)
      }
    }
  },
  async mounted() {
    try {
      // 如果你有 body 滚动控制，可以在这儿调用：
      // useBodyScrollable(this.isLogin)

      // 等待挂载并实例化 URS 弹框
      await AppURS({
        element: 'urs-container',
        type: 'login',
        callback: this.login,
      })
    } catch (err) {
      console.error('初始化 URS 登录失败：', err)
    }
  },
}
</script>

<style lang="less" scoped>
@import './style.less';

.app-login {

  width: 575px;
  position: relative;

}
</style>

<!-- <style src="./css/urs_login_css.css"></style> -->
