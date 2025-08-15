export class StorageFactory {
  constructor(opts = {}) {
    // 默认使用 localStorage
    this.storage = opts.storage || window.localStorage;
  }

  /**
   * 获取存储值
   * @param {string} key - 键名
   * @returns {any} - 解析后的值
   */
  get(key) {
    const v = this.storage.getItem(key);
    if (v === null) return null;
    
    try {
      return JSON.parse(v);
    } catch (e) {
      // 如果解析失败，直接返回原始值
      return v;
    }
  }

  /**
   * 设置存储值
   * @param {string} key - 键名
   * @param {any} value - 要存储的值
   */
  set(key, value = null) {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    this.storage.setItem(key, v);
  }

  /**
   * 移除存储值
   * @param {string} key - 键名
   */
  remove(key) {
    this.storage.removeItem(key);
  }

  /**
   * 读取后删除
   * @param {string} key - 键名
   * @returns {any} - 读取后删除的值
   */
  burnAfterRead(key) {
    const v = this.get(key);
    this.remove(key);
    return v;
  }
}

// 默认导出localStorage实例
export const storage = new StorageFactory();