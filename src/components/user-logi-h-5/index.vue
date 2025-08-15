<template>
  <div>
    <div class="h5_phone_login" v-if="step === 1">
      <div class="h5_phone_login-close" @click="onCancel"></div>

      <div :class="['h5_phone_login-head', { hidden: !logoShow }]">
        <img :src="logoUrl" alt="logo" />
      </div>

      <div class="h5_phone_login-title">手机号登录</div>

      <div v-if="errorMsg" class="h5_phone_login-error">{{ errorMsg }}</div>
      <div v-else class="h5_phone_login-tips">手机号</div>

      <div class="h5_phone_login-phone">
        <span class="h5_phone_login-countrycode" @click="openCountryPicker">+{{ pickerCountryCode }}</span>
        <a-input placeholder="手机号" maxlength="15" v-model="phone" @input="phoneChange" />
      </div>

      <div id="captcha"></div>

      <div :class="['h5_phone_login-btn', { disable: pickerCountryCode.length + phone.length < 6 || !agreement }]"
        @click="getNewCode">
        收取验证码
      </div>

      <div class="h5_phone_login-protocol">
        <span :class="['h5_phone_login-protocol-agreement', { checked: agreement }]" @click="changeAgreement"></span>
        同意
        <a href="https://game.academy.163.com/api/academy/config/contract.html" target="_blank">
          《网易游学用户服务协议》
        </a>、
        <a href="https://game.academy.163.com/ssi/docs/legal.html" target="_blank">
          《网易游学隐私政策》
        </a>、
        <a href="https://game.academy.163.com/ssi/docs/protect.html" target="_blank">
          《网易游学儿童个人信息保护规则及监护人须知》
        </a>、
        <a href="https://game.academy.163.com/ssi/docs/sdk-vendors.html" target="_blank">
          《第三方服务共享清单》
        </a>
      </div>

      <actionsheet ref="actionsheetRef" :touchEnable="false">
        <div class="actionsheet-control">
          <div class="actionsheet-control-btn" @click="onCancelPicker">取消</div>
          <div class="actionsheet-control-btn sumbit" @click="onOkPicker">确认</div>
        </div>
        <picker indicatorClassName="my-picker-indicator" :selectedValue="pickerCountryCode"
          @valueChange="onChangePicker">
          <picker-item v-for="item in countryCodes" :key="item.label" :value="item.value">
            {{ item.label }}
          </picker-item>
        </picker>
      </actionsheet>
    </div>
    <div class="h5_phone_login" v-if="step === 2">
      <div class="h5_phone_login-close goBack" @click="setStep(1)"></div>

      <div class="h5_phone_login-title">请输入验证码</div>

      <div v-if="errorMsg" class="h5_phone_login-error">{{ errorMsg }}</div>
      <div v-else class="h5_phone_login-tips">验证码</div>

      <div class="h5_phone_login-code">
        <Code :submit="changeCodeValue" :clearErrorMsg="clearErrorMsg" />
      </div>

      <div class="h5_phone_login-msg-tips">短信验证码发送至 {{ phone }}</div>

      <div v-if="countdownTime > 0" class="h5_phone_login-countdown">{{ countdownTime }}s后重新获取</div>

      <div v-else class="h5_phone_login-reset-btn" @click="getNewCode">
        获取验证码
      </div>
    </div>
  </div>

</template>



<script>
import { Input } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import classNames from 'classnames'
import userService from './server.js'
import logoUrl from './h5/logo.png'

// Code.vue 是你自定义验证码输入框组件，我先假设你会提供
import Code from './code.vue'

// 创建简单的 actionsheet 组件
const Actionsheet = {
  name: 'Actionsheet',
  props: {
    touchEnable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    }
  },
  render(h) {
    if (!this.visible) return null
    return h('div', {
      class: 'actionsheet-overlay',
      on: {
        click: this.hide
      }
    }, [
      h('div', {
        class: 'actionsheet-content',
        on: {
          click: (e) => e.stopPropagation()
        }
      }, this.$slots.default)
    ])
  }
}

// 创建简单的 picker 组件
const Picker = {
  name: 'Picker',
  props: {
    selectedValue: {
      type: String,
      default: ''
    },
    indicatorClassName: {
      type: String,
      default: ''
    }
  },
  render(h) {
    return h('div', {
      class: ['picker-container', this.indicatorClassName]
    }, this.$slots.default)
  }
}

// 创建简单的 picker-item 组件
const PickerItem = {
  name: 'PickerItem',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h('div', {
      class: 'picker-item',
      on: {
        click: () => this.$emit('valueChange', this.value)
      }
    }, this.$slots.default)
  }
}

let copyPhone = ''
let copyCountryCode = '86'

export default {
  name: 'H5Login',
  components: {
    AInput: Input,
    Code,
    Actionsheet,
    Picker,
    PickerItem,
  },
  props: {
    onOk: Function,
  },
  data() {
    return {
      logoUrl,
      phone: '',
      agreement: false,
      isIOS: false,
      isAndroid: false,
      logoShow: true,
      step: 1,
      countdownTime: 0,
      captchaIns: null,
      errorMsg: '',
      countryCode: '86',
      pickerCountryCode: '86',
      countryCodes: [
        { label: '中国 +86', value: '86' },
        { label: '台湾地区 +886', value: '886' },
        { label: '香港地区 +852', value: '852' },
        { label: '澳门地区 +853', value: '853' },
        { label: '新加坡 +65', value: '65' },
        { label: '日本 +81', value: '81' },
        { label: '韩国 +82', value: '82' },
        { label: '美国 +1', value: '1' },
        { label: '加拿大 +1', value: '1' },
        { label: '澳大利亚 +61', value: '61' },
        { label: '新西兰 +64', value: '64' },
        { label: '比利时 +32', value: '32' },
        { label: '丹麦 +45', value: '45' },
        { label: '德国 +49', value: '49' },
        { label: '法国 +33', value: '33' },
        { label: '芬兰 +358', value: '358' },
        { label: '荷兰 +31', value: '31' },
        { label: '捷克共和国 +420', value: '420' },
        { label: '意大利 +39', value: '39' },
        { label: '英国 +44', value: '44' },
      ],
    }
  },
  mounted() {
    if (!document.getElementById('netease-captcha-script')) {
      const script = document.createElement('script')
      script.id = 'netease-captcha-script'
      script.src = 'https://cstaticdun.126.net/load.min.js?t=202003241201'
      script.async = true
      script.onload = () => {
        console.log('网易易盾脚本加载完成')
        // 你可以在这里初始化验证码组件
      }
      document.body.appendChild(script)
    }
    this.checkUa()
    setTimeout(() => {
      this.initCaptcha()
    }, 500)

    // iOS 软键盘监听
    if (this.isIOS) {
      document.body.addEventListener('focusin', this.focusInHandler)
      document.body.addEventListener('focusout', this.focusOutHandler)
    }

    // Android 软键盘监听
    if (this.isAndroid) {
      this.originalHeight = document.documentElement.clientHeight || document.body.clientHeight
      window.addEventListener('resize', this.resizeHandler)
    }
  },
  beforeDestroy() {
    if (this.isIOS) {
      document.body.removeEventListener('focusin', this.focusInHandler)
      document.body.removeEventListener('focusout', this.focusOutHandler)
    }
    if (this.isAndroid) {
      window.removeEventListener('resize', this.resizeHandler)
    }
  },
  methods: {
    focusInHandler() {
      this.logoShow = false
    },
    focusOutHandler() {
      this.logoShow = true
      window.scrollTo(0, 0)
    },
    resizeHandler() {
      const newHeight = document.documentElement.clientHeight || document.body.clientHeight
      if (newHeight < this.originalHeight) {
        this.logoShow = false
      } else {
        this.logoShow = true
        window.scrollTo(0, 0)
      }
    },
    checkUa() {
      const ua = navigator.userAgent.toLowerCase()
      this.isIOS = /iphone|ipad|ipod/.test(ua)
      this.isAndroid = /android/.test(ua)
    },
    phoneChange(e) {
      // 确保输入的是数字
      const value = e.target.value.replace(/[^\d]/g, '')
      this.phone = value
      copyPhone = this.phone
      this.errorMsg = ''
    },
    changeAgreement() {
      this.agreement = !this.agreement
    },
    getNewCode() {
      if (this.pickerCountryCode.length + this.phone.length >= 6 && this.agreement) {
        try {
          if (this.captchaIns && typeof this.captchaIns.verify === 'function') {
            this.captchaIns.refresh()
            this.captchaIns.verify()
          } else {
            this.initCaptcha()
            setTimeout(() => {
              this.getNewCode()
            }, 1000)
          }
        } catch (error) {
          console.error('获取验证码失败:', error)
          this.errorMsg = '验证码服务暂时不可用，请稍后重试'
        }
      } else {
        if (!this.agreement) {
          this.errorMsg = '请先同意用户协议'
        } else if (this.pickerCountryCode.length + this.phone.length < 6) {
          this.errorMsg = '请输入正确的手机号'
        }
      }
    },
    nextStep() {
      this.errorMsg = ''
      this.startCountDown()
      this.step = 2
    },
    startCountDown() {
      this.countdownTime = 60
      this.tickCountdown()
    },
    tickCountdown() {
      if (this.countdownTime > 0) {
        setTimeout(() => {
          this.countdownTime--
          this.tickCountdown()
        }, 1000)
      }
    },
    changeCodeValue(value) {
      const fullPhone = this.countryCode === '86' ? this.phone : `${this.countryCode}-${this.phone}`
      const params = {
        code: value,
        phone: fullPhone,
        rmsFrom: '',
      }
      userService
        .H5Login(params)
        .then(() => {
          this.onOk && this.onOk(true)
          this.closeLogin()
          this.errorMsg = ''
        })
        .catch(e => {
          this.errorMsg = e.message || '验证码错误，请重新输入'
          if (this.captchaIns && typeof this.captchaIns.refresh === 'function') {
            this.captchaIns.refresh()
          }
        })
    },
    clearErrorMsg() {
      this.errorMsg = ''
    },
    initCaptcha() {
      try {
        if (window.initNECaptcha) {
          window.initNECaptcha(
            {
              captchaId: '339d2cf4f6af43a8b7c46cab3cfee061',
              element: '#captcha',
              mode: 'bind',
              onVerify: (err, data) => {
                if (!err) this.sendCode(data.validate)
              },
            },
            ins => {
              this.captchaIns = ins
            },
            err => {
              console.log('验证码初始化失败', err)
              // 如果验证码初始化失败，可以尝试直接发送验证码
              this.errorMsg = '验证码加载失败，请重试'
            }
          )
        } else {
          console.log('验证码SDK未加载')
          this.errorMsg = '验证码服务暂时不可用，请稍后重试'
        }
      } catch (error) {
        console.error('验证码初始化错误:', error)
        this.errorMsg = '验证码初始化失败，请刷新页面重试'
      }
    },
    sendCode(validate) {
      if (validate && copyPhone) {
        const fullPhone = copyCountryCode === '86' ? copyPhone : `${copyCountryCode}-${copyPhone}`
        const params = {
          phone: fullPhone,
          neCaptchaValidate: validate,
          rmsFrom: '',
        }
        userService
          .getLoginCode(params)
          .then(() => {
            console.log('发送验证码成功')
            this.nextStep()
            if (this.captchaIns && typeof this.captchaIns.refresh === 'function') {
              this.captchaIns.refresh()
            }
          })
          .catch(err => {
            // console.log('发送验证码成功')
            // this.setStep(2)
            this.errorMsg = err.message || '发送验证码失败，请重试'
            if (this.captchaIns && typeof this.captchaIns.refresh === 'function') {
              this.captchaIns.refresh()
            }
          })
      } else {
        this.errorMsg = '请先输入手机号'
      }
    },
    closeLogin() {
      // 如果你用 Vuex，则从 this.$store.dispatch 调用 closeLogin
      this.$emit('close') // 或根据你的逻辑处理
    },
    onCancel() {
      this.$emit('close')
    },
    openCountryPicker() {
      // 打开国家选择器
      if (this.$refs.actionsheetRef) {
        this.$refs.actionsheetRef.show()
      }
    },
    onCancelPicker() {
      if (this.$refs.actionsheetRef) {
        this.$refs.actionsheetRef.hide()
      }
    },
    onOkPicker() {
      this.countryCode = this.pickerCountryCode
      copyCountryCode = this.pickerCountryCode
      if (this.$refs.actionsheetRef) {
        this.$refs.actionsheetRef.hide()
      }
    },
    onChangePicker(value) {
      this.pickerCountryCode = value
    },
    setStep(step) {
      this.step = step
      this.errorMsg = ''
    },
  },
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
