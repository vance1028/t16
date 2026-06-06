<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
      width="240"
      theme="dark"
    >
      <div class="logo">
        <SafetyOutlined style="font-size: 28px; color: #1890ff" />
        <span v-if="!collapsed" class="logo-text">地质灾害管理</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>态势看板</span>
        </a-menu-item>
        <a-menu-item key="/hazard-points">
          <template #icon>
            <ExclamationCircleOutlined />
          </template>
          <span>隐患点管理</span>
        </a-menu-item>
        <a-menu-item v-if="['admin', 'inspector'].includes(userRole)" key="/inspection-tasks">
          <template #icon>
            <CheckSquareOutlined />
          </template>
          <span>巡查任务</span>
        </a-menu-item>
        <a-menu-item v-if="['admin', 'monitor'].includes(userRole)" key="/warnings">
          <template #icon>
            <WarningOutlined />
          </template>
          <span>预警工作台</span>
        </a-menu-item>
        <a-menu-item v-if="userRole === 'admin'" key="/users">
          <template #icon>
            <UserOutlined />
          </template>
          <span>用户管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <a-button
            type="text"
            @click="collapsed = !collapsed"
            style="font-size: 18px"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <a-space>
            <a-badge :count="activeWarningCount" :offset="[-5, 5]">
              <a-button type="text" @click="$router.push('/warnings')">
                <BellOutlined style="font-size: 18px" />
              </a-button>
            </a-badge>
            <a-dropdown>
              <a class="user-info" @click.prevent>
                <a-avatar :size="32" style="background-color: #1890ff">
                  {{ userName.charAt(0) }}
                </a-avatar>
                <span v-if="!collapsed" class="user-name">{{ userName }}</span>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item disabled>
                    <UserOutlined /> {{ userName }}
                  </a-menu-item>
                  <a-menu-item disabled>
                    <SafetyOutlined /> {{ roleLabel }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  DashboardOutlined,
  ExclamationCircleOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';
import { UserRoleLabels } from '@/types';
import { getRecentWarnings } from '@/api/dashboard';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([route.path]);
const activeWarningCount = ref(0);

const userName = computed(() => userStore.user?.name || '');
const userRole = computed(() => userStore.user?.role || '');
const roleLabel = computed(() => userRole.value ? UserRoleLabels[userRole.value as keyof typeof UserRoleLabels] : '');

const currentPageTitle = computed(() => {
  return (route.meta.title as string) || '地质灾害隐患点管理平台';
});

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key);
};

const handleLogout = () => {
  userStore.logout();
  message.success('已退出登录');
  router.push('/login');
};

const loadActiveWarnings = async () => {
  try {
    const warnings = await getRecentWarnings();
    activeWarningCount.value = warnings.length;
  } catch (error) {
    console.error('获取预警数量失败:', error);
  }
};

onMounted(() => {
  selectedKeys.value = [route.path];
  loadActiveWarnings();
});
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-name {
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}

.content {
  margin: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  min-height: calc(100vh - 112px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
