import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '态势看板', icon: 'DashboardOutlined' }
      },
      {
        path: 'hazard-points',
        name: 'HazardPoints',
        component: () => import('@/views/HazardPoints.vue'),
        meta: { title: '隐患点管理', icon: 'ExclamationCircleOutlined', roles: ['admin', 'inspector', 'monitor'] }
      },
      {
        path: 'inspection-tasks',
        name: 'InspectionTasks',
        component: () => import('@/views/InspectionTasks.vue'),
        meta: { title: '巡查任务', icon: 'CheckSquareOutlined', roles: ['admin', 'inspector'] }
      },
      {
        path: 'warnings',
        name: 'Warnings',
        component: () => import('@/views/Warnings.vue'),
        meta: { title: '预警工作台', icon: 'WarningOutlined', roles: ['admin', 'monitor'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', icon: 'UserOutlined', roles: ['admin'] }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  userStore.loadUserFromStorage();

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/');
  } else {
    const requiredRoles = to.meta.roles as string[] | undefined;
    if (requiredRoles && userStore.userRole && !requiredRoles.includes(userStore.userRole)) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
