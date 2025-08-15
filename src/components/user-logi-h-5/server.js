import axios from 'axios'
import md5 from 'md5'
import forge from 'node-forge'
import { getUid } from './utils/uid.js';


// 配置axios基础设置
// const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api'

// 创建axios实例
const http = axios.create({
    baseURL: 'https://game.academy.163.com/api/academy',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

// 请求拦截器 - 添加鉴权信息
http.interceptors.request.use(
    async (config) => {
        // 添加用户指纹
        const uid = localStorage.getItem('NeteaseGADataUid') || await getUid()
        if (uid) {
            config.headers['NeteaseGADataUid'] = uid
        }

        // 添加CSRF Token（修改类请求需要）
        if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            const csrfToken = localStorage.getItem('NeteaseGACSRFToken')
            if (csrfToken) {
                config.headers['NeteaseGACSRFToken'] = csrfToken
            }
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一处理响应
http.interceptors.response.use(
    (response) => {
        const { data } = response

        // 处理CSRF Token
        const csrfToken = response.headers['neteasgacsrftoken']
        if (csrfToken) {
            localStorage.setItem('NeteaseGACSRFToken', csrfToken)
        }

        // 统一响应格式处理
        if (data.status === 1) {
            // 成功响应，直接返回data字段
            return data.data || data
        } else {
            // 业务错误
            const error = new Error(data.message || '请求失败')
            error.code = data.status
            return Promise.reject(error)
        }
    },
    (error) => {
        // 处理HTTP错误
        if (error.response) {
            const { status, data } = error.response

            // 401未授权，跳转登录
            if (status === 401) {
                // 可以在这里触发登录弹窗或跳转登录页
                console.log('需要登录')
            }

            const errorMsg = data?.message || `请求失败: ${status}`
            const customError = new Error(errorMsg)
            customError.code = status
            return Promise.reject(customError)
        }

        return Promise.reject(error)
    }
)



// 加密用户账号信息（用于Corp登录）
function encryptUserAccount(data) {
    const psw = md5(data.password)
    const timestamp = new Date().getTime()
    const time = parseInt(timestamp / 1000 / 60)
    const sign = Math.random().toString(36).substr(2).slice(2, 10)
    const name = data.name.split('@')
    const result = `${name[0]},${sign}${psw},,${time}`

    // RSA公钥加密
    const pubKey = forge.pki.publicKeyFromPem(`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4bXX9q4xs4meOjpkyesqWjdP+
oRwtY7CBsU2MBHA5VsDksYjwlpCbRHpdrvOcfOlaX8foOhL94W6+iLtkGDmX2mA7
v6dC0NfEaRlpq7KfpSTgJo8u/2Sd/faczs3q+dzW1ptnWSHImSq6hUbo1gsl5bZi
Atatpxum7reF1Zi30wIDAQAB
-----END PUBLIC KEY-----`)

    const encryptedData = pubKey.encrypt(result, 'RSAES-PKCS1-V1_5')
    const secret = forge.util.encode64(encryptedData)
    return secret
}

// 登录服务类
class LoginService {
    /**
     * URS登录（网易统一登录系统）
     * @param {Object} data - 登录数据
     * @param {string} data.inputMail - 邮箱地址（可选）
     * @returns {Promise<Object>} 登录结果
     */
    async login(data = {}) {
        try {
            const response = await http.post('/user/web_login', { data })
            return response
        } catch (error) {
            console.error('URS登录失败:', error)
            throw error
        }
    }

    /**
     * Corp邮箱登录
     * @param {Object} account - 账号信息
     * @param {string} account.name - 企业邮箱
     * @param {string} account.password - 密码
     * @returns {Promise<Object>} 登录结果
     */
    async corpLogin(account) {
        try {
            const secret = encryptUserAccount(account)
            const response = await http.post('/user/corp_login', {
                data: { secret }
            })
            return response
        } catch (error) {
            console.error('Corp登录失败:', error)
            throw error
        }
    }

    /**
     * 获取用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async getUserInfo() {
        try {
            const timestamp = Date.now()
            const response = await http.get(`/user/user/0?t=${timestamp}`)
            return response
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }

    /**
     * 手机号绑定
     * @param {Object} data - 绑定数据
     * @returns {Promise<Object>} 绑定结果
     */
    async bind(data) {
        try {
            const response = await http.post('/user/web_bind', { data })
            return response
        } catch (error) {
            console.error('手机号绑定失败:', error)
            throw error
        }
    }

    /**
     * Corp邮箱绑定
     * @param {Object} account - 账号信息
     * @returns {Promise<Object>} 绑定结果
     */
    async corpBind(account) {
        try {
            const secret = encryptUserAccount(account)
            const response = await http.post('/user/corp_bind', {
                data: { secret }
            })
            return response
        } catch (error) {
            console.error('Corp绑定失败:', error)
            throw error
        }
    }

    /**
     * 老用户登录
     * @param {Object} data - 登录数据
     * @returns {Promise<Object>} 登录结果
     */
    async oldUserLogin(data = {}) {
        try {
            const response = await http.post('/user/old_user_login', { data })
            return response
        } catch (error) {
            console.error('老用户登录失败:', error)
            throw error
        }
    }

    /**
     * 退出登录
     * @returns {Promise<Object>} 退出结果
     */
    async logout() {
        try {
            const response = await http.delete('/user/logout')
            // 清除本地存储的登录信息
            localStorage.removeItem('NeteaseGACSRFToken')
            localStorage.removeItem('NeteaseGADataUid')
            return response
        } catch (error) {
            console.error('退出登录失败:', error)
            throw error
        }
    }

    /**
     * H5登录验证
     * @param {Object} data - 验证数据
     * @param {string} data.code - 验证码
     * @param {string} data.phone - 手机号
     * @param {string} data.rmsFrom - 来源
     * @returns {Promise<Object>} 验证结果
     */
    async H5Login(data) {
        try {
            const response = await http.post('/user/sms_login', { data })
            return response
        } catch (error) {
            console.error('H5登录验证失败:', error)
            throw error
        }
    }

    /**
     * 获取登录验证码
     * @param {Object} data - 请求数据
     * @param {string} data.phone - 手机号
     * @param {string} data.neCaptchaValidate - 验证码验证结果
     * @param {string} data.rmsFrom - 来源
     * @returns {Promise<Object>} 发送结果
     */
    async getLoginCode(data) {
        try {
            const response = await http.post('/user/sms_login/code', { data })
            return response
        } catch (error) {
            console.error('获取登录验证码失败:', error)
            throw error
        }
    }
}

// 创建服务实例
const loginService = new LoginService()

export default loginService 