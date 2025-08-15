<template>
    <div class="h5-login-code">
      <div class="h5-login-code-input">
        <div
          v-for="index in 6"
          :key="index"
          :class="['h5-login-code-input-item', { inputed: inputValues[index - 1] }]"
        >
          <a-input
            ref="inputs"
            type="tel"
            pattern="[0-9]*"
            :value="inputValues[index - 1]"
            @focus="onFocus(index)"
            @keydown.native="handleKeydown($event, index)"
            @input="valueChange($event, index)"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // import { Input } from 'ant-design-vue'
  import classNames from 'classnames'
  import './style.less'
  
  export default {
    name: 'CodeInput',
    components: {
      AInput: Input,
    },
    props: {
      submit: Function,
      clearErrorMsg: Function,
    },
    data() {
      return {
        inputValues: ['', '', '', '', '', ''],
      }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.$refs.inputs && this.$refs.inputs[0]) {
          this.$refs.inputs[0].focus()
        }
      })
    },
    methods: {
            valueChange(e, index) {
        let value = e.target.value
        // 只允许数字输入
        value = value.replace(/[^\d]/g, '')
        
        const oldValue = this.inputValues[index - 1]
        if (oldValue && value.length > 1) {
          value = value.replace(oldValue, '')
        }

        if ((value && /^\d+$/.test(value)) || !value) {
          if (value.length > 1) {
            const split = value.split('')
            split.forEach((char, i) => {
              if (index - 1 + i < 6) {
                this.$set(this.inputValues, index - 1 + i, char)
              }
            })
            this.clearErrorMsg?.()
            this.submitHandle()
            
            // 聚焦到下一个输入框
            const nextIndex = Math.min(index - 1 + split.length, 5)
            if (this.$refs.inputs && this.$refs.inputs[nextIndex]) {
              this.$refs.inputs[nextIndex].focus()
            }
          } else {
            this.$set(this.inputValues, index - 1, value)
            this.clearErrorMsg?.()
            this.submitHandle()
            
            // 如果输入了数字，聚焦到下一个输入框
            if (value && index < 6) {
              this.$nextTick(() => {
                if (this.$refs.inputs && this.$refs.inputs[index]) {
                  this.$refs.inputs[index].focus()
                }
              })
            }
          }
        }
      },
      handleKeydown(e, index) {
        if (e.keyCode === 8) {
          this.$set(this.inputValues, index - 1, '')
          this.clearErrorMsg?.()
          if (index > 1) {
            this.$nextTick(() => {
              if (this.$refs.inputs && this.$refs.inputs[index - 2]) {
                this.$refs.inputs[index - 2].focus()
              }
            })
          }
          e.preventDefault()
        }
      },
      onFocus(index) {
        this.$nextTick(() => {
          for (let i = 0; i < index - 1; i++) {
            if (!this.inputValues[i]) {
              if (this.$refs.inputs && this.$refs.inputs[i]) {
                this.$refs.inputs[i].focus()
              }
              break
            }
          }
        })
      },
      submitHandle() {
        if (this.inputValues.every(v => v)) {
          const code = this.inputValues.join('')
          this.submit?.(code)
        }
      },
      resetNumber() {
        this.inputValues = ['', '', '', '', '', '']
      },
    },
  }
  </script>
  
  <style lang="less" scoped>
  @import './style.less';
  </style>
  