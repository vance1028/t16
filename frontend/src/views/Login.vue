<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>地质灾害隐患点管理平台</h1>
        <p>Geological Hazard Management System</p>
      </div>
      <a-form
        :model="formState"
        @finish="handleLogin"
        layout="vertical"
        size="large"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            :prefix="h('UserOutlined')"
          />
        </a-form-item>
        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            :prefix="h('LockOutlined')"
          />
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
      <div class="login-tips">
        <p>测试账号：</p>
        <p>管理员：admin / 123456</p>
        <p>巡查员：inspector / 123456</p>
        <p>值班员：monitor / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const formState = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;
  try {
    await userStore.login(formState);
    message.success('登录成功');
    router.push('/');
  } catch (error: any) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.login-tips {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.8;
}

.login-tips p {
  margin: 0;
}
</style>
