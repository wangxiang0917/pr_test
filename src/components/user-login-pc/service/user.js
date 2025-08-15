import http from '../api/http';

/**
 * 用户服务类
 * 封装与用户相关的请求
 */
class UserService {
    /**
     * 用户登录
     * @param {Object} data - 登录参数（例如：{ username, password }）
     * @returns {Promise<Object>} 登录响应数据
     */
    async login(data) {
        return http.post('/user/web_login', data, {

            requestType: 'json' // 指定为 JSON 格式
        });
    }

    /**
     * 获取当前用户信息
     * @returns {Promise<Object>} 用户信息对象
     */
    async getUserInfo() {
        return http.get(`/user/user/0?t=${Date.now()}`, {
            msgable: false
        });
    }
}

const userService = new UserService();
export default userService;
