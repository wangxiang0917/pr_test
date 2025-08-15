import axios from 'axios';
import { storage } from '../utils/storage.js';
import { getUid } from '../utils/uid.js';

// 创建 axios 实例
const http = axios.create({
    // baseURL: process.env.VUE_APP_API_PREFIX || '/academy/api',
    // baseURL: 'https://game.academy.163.com/academy/api',
    baseURL: '/academy/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true,  // 允许携带cookie

});

// 请求拦截器
http.interceptors.request.use(
    async (config) => {
        // 添加 UID 头
        const uid = await getUid();
        if (uid) {
            config.headers['NeteaseGADataUid'] = uid;
        }

        // 修改类请求添加 CSRF Token
        const methodsNeedCsrf = ['post', 'put', 'patch', 'delete'];
        if (methodsNeedCsrf.includes(config.method.toLowerCase())) {
            const csrfToken = storage.get('NeteaseGACSRFToken');
            if (csrfToken) {
                config.headers['NeteaseGACSRFToken'] = csrfToken;
            }
        }

        // 设置请求数据格式
        // debugger
        if (config.requestType === 'json') {
            config.headers['Content-Type'] = 'application/json';
        } else if (config.data && !(config.data instanceof FormData)) {
            // 自动转为 FormData 格式
            const formData = new FormData();
            Object.entries(config.data).forEach(([key, value]) => {
                formData.append(key, value);
            });
            config.data = formData;
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
http.interceptors.response.use(
    (response) => {
        // 保存 CSRF Token
        const token = response.headers['neteasegacsrftoken'];
        if (token) {
            storage.set('NeteaseGACSRFToken', token);
        }

        const res = response.data;

        // 接口成功
        if (res.status === 1) {
            // 自动解包 response 结构
            const [, dataKey] = Object.entries(res)[1] || [];
            return dataKey ?? res.data ?? res;
        }

        // 接口业务失败
        console.error(`API Error [${res.status}]: ${res.message}`);
        throw new Error(res.message || '接口请求失败');
    },
    (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default http;
