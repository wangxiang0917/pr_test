import Fingerprint2 from 'fingerprintjs2'; // 老版本库名是 fingerprintjs2

const UID_KEY = 'NeteaseGADataUid';
import { storage } from './storage';

/**
 * 获取或生成用户唯一标识
 * @returns {Promise<string>} - 用户唯一标识
 */
export async function getUid() {
  let uid = storage.get(UID_KEY);
  if (uid) {
    return uid;
  }

  try {
    // 老版本 FingerprintJS2 需要异步延时等待，确保所有指纹数据准备好
    return new Promise((resolve, reject) => {
      Fingerprint2.get(components => {
        // components 是数组，合成一个hash字符串作为visitorId
        const values = components.map(component => component.value);
        const visitorId = Fingerprint2.x64hash128(values.join(''), 31);

        storage.set(UID_KEY, visitorId);
        resolve(visitorId);
      });
    });
  } catch (error) {
    console.error('获取用户指纹失败:', error);
    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    storage.set(UID_KEY, tempId);
    return tempId;
  }
}
