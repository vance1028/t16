import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { login as apiLogin, getProfile } from '@/api/auth';
import type { LoginParams } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);

  const initUser = async () => {
    if (token.value && !user.value) {
      try {
        const profile = await getProfile();
        user.value = profile;
      } catch (error) {
        logout();
      }
    }
  };

  const login = async (params: LoginParams) => {
    const response = await apiLogin(params);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  };

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    login,
    logout,
    initUser,
    loadUserFromStorage
  };
});
