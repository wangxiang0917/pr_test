// app-urs.js

// 判断运行环境
const isServer = typeof window === 'undefined'

/**
 * 动态注入脚本
 * @param {{id: string, src: string}|Array} script
 * @returns {Promise}
 */
export function injectScript(script) {
    if (Array.isArray(script)) {
        return Promise.all(script.map(s => injectScript(s)))
    }
    const { id, src } = script
    if (isServer) return Promise.reject(new Error('Server environment'))
    if (window.document.getElementById(id)) return Promise.resolve()
    return new Promise((resolve, reject) => {
        const tag = document.createElement('script')
        tag.id = id
        tag.src = src
        tag.addEventListener('load', resolve)
        tag.addEventListener('error', reject)
        window.document.head.appendChild(tag)
    })
}

// URS SDK 的常量配置
const URS_PRODUCT = 'game_academy'
const URS_PRODUCT_KEY = '28f07a78adf544eca9cb076367a6b247'
const URS_PROMARK = 'ioBhGnN'
// const URS_HOST = '127.0.0.1:8008'
const URS_HOST = 'game.academy.163.com'
// const URS_LIB_URL = './urswebzj_message.js'
// const URS_LIB_URL = 'https://edu-20230301.oss-cn-beijing.aliyuncs.com/urswebzj_message.js'
const URS_LIB_URL = 'https://edu-20230301.oss-cn-beijing.aliyuncs.com/urswebzj_message.browser.umd.js'
const LINKS = [
    {
        name: '《网易游学用户服务协议》',
        url: 'https://game.academy.163.com/api/academy/config/contract.html',
        txt: '《网易游学用户服务协议》',
    },
    {
        name: '《网易游学隐私政策》',
        url: 'https://game.academy.163.com/ssi/docs/legal.html',
        txt: '《网易游学隐私政策》',
    },
    {
        name: '《网易游学儿童个人信息保护规则及监护人须知》',
        url: 'https://game.academy.163.com/ssi/docs/protect.html',
        txt: '《网易游学儿童个人信息保护规则及监护人须知》',
    },
    {
        name: '《第三方服务共享清单》',
        url: 'https://game.academy.163.com/ssi/docs/sdk-vendors.html',
        txt: '《第三方服务共享清单》',
    },
]

/**
 * 初始化并打开 URS 登录/绑定 弹框
 * @param {{ element: string, type: 'login'|'bind', callback: Function }} options
 * @returns {Promise<window.URS>}
 */
export async function AppURS({ element, type, callback }) {
    if (isServer) throw new Error('Must run in browser')
    // 构造 URS 配置
    const cfg = {
        includeBox: element,
        newCDN: 1,
        version: 3,
        uniteLogin: {
            isItl: 1,
            first: 1,
            loginTxt: '登录',
            placeholders: {
                mob: '请输入手机号',
                cap: '请输入图片验证码',
                sms: '请输入短信验证码',
            },
            needClause: 1,
            clause: 0,
            uniteLoginTermsList: LINKS,
        },
        product: URS_PRODUCT,
        productKey: URS_PRODUCT_KEY,
        promark: URS_PROMARK,
        host: URS_HOST,
        cssDomain: `${window.location.origin}\\static\\css\\`,
        cssFiles: `urs_${type}_css.css`,
        page: 'login',
        needMobileLogin: 1,
        mobileFirst: 1,
        mbNeedItl: 1,
        mbOnlyItl: 1,
        smsLoginFirst: 1,
        smsBtnTxt: '登 录',
        mbBtnTxt: '登 录',
        logincb: callback,
    }

    if (type === 'login') {
        Object.assign(cfg, {
            mailloginclause: { list: LINKS },
            needRegAgreeNoChecked: 1,
            terms: LINKS,
            needRegAgreeMbNoChecked: 1,
            mbRegTermsList: LINKS,
            regMbTxt: '注册',
            noMobileReg: 0,
            mbNoPwd: 0,
            needMobileReg: 1,
            single: 0,
        })
    }

    // 1. 动态注入 URS 脚本
    await injectScript({ id: 'urs-lib', src: URS_LIB_URL })

    // 2. 返回 SDK 实例，弹框会自动打开
    return new window.URS(cfg)
}
