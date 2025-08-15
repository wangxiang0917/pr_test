<template>
    <a-modal
      :visible="visible"
      :footer="null"
      @cancel="handleCancel"
      :closable="false"
      centered
      wrap-class-name="country-picker-modal"
      :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
    >
      <div class="picker-content">
        <div class="picker-header">
          <span @click="handleCancel">取消</span>
          <span @click="confirmSelect">确定</span>
        </div>
        <div class="picker-list">
          <div
            v-for="item in countryCodes"
            :key="item.value"
            :class="['picker-item', { active: item.value === currentValue }]"
            @click="currentValue = item.value"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </a-modal>
  </template>
  
  <script>
  export default {
    name: 'CountryPicker',
    props: {
      visible: Boolean,
      value: String,
      countryCodes: Array,
    },
    data() {
      return {
        currentValue: this.value || '86',
      }
    },
    watch: {
      value(val) {
        this.currentValue = val
      },
    },
    methods: {
      handleCancel() {
        this.$emit('update:visible', false)
      },
      confirmSelect() {
        this.$emit('update:visible', false)
        this.$emit('select', this.currentValue)
      },
    },
  }
  </script>
  
  <style scoped>
  .picker-content {
    padding: 10px 0;
  }
  .picker-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    font-size: 16px;
  }
  .picker-list {
    max-height: 300px;
    overflow-y: auto;
  }
  .picker-item {
    padding: 12px 20px;
    text-align: center;
    font-size: 16px;
    border-bottom: 1px solid #eee;
  }
  .picker-item.active {
    background: #f0f0f0;
    color: #1890ff;
  }
  </style>
  