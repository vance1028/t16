import axios from 'axios';
import { message } from 'ant-design-vue';
import router from '@/router';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error('登录已过期，请重新登录');
        router.push('/login');
      } else if (status === 403) {
        message.error('权限不足');
      } else if (status === 404) {
        message.error('请求的资源不存在');
      } else if (status === 500) {
        message.error('服务器内部错误');
      } else if (data?.message) {
        message.error(data.message);
      }
    } else {
      message.error('网络错误，请检查连接');
    }
    
    return Promise.reject(error);
  }
);

export default request;
