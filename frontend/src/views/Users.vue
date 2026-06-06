<template>
  <div class="users">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <a-space>
        <a-select
          v-model:value="filterRole"
          placeholder="角色筛选"
          style="width: 150px"
          allow-clear
          @change="loadData"
        >
          <a-select-option value="admin">管理员</a-select-option>
          <a-select-option value="inspector">巡查员</a-select-option>
          <a-select-option value="monitor">监控值班员</a-select-option>
        </a-select>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined /> 新增用户
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="users"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'role'">
          <a-tag :color="getRoleColor(record.role)">
            {{ UserRoleLabels[record.role] }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除此用户吗？"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" size="small" danger>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="formVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      @ok="handleSubmit"
      @cancel="formVisible = false"
      :confirm-loading="submitting"
      width="500px"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input v-model:value="formState.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="密码" :required="!isEdit">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
          />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="formState.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="inspector">巡查员</a-select-option>
            <a-select-option value="monitor">监控值班员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users';
import type { User, UserRole } from '@/types';
import { UserRoleLabels } from '@/types';
import type { ColumnType } from 'ant-design-vue/es/table';

const loading = ref(false);
const submitting = ref(false);
const users = ref<User[]>([]);
const filterRole = ref<UserRole | undefined>();

const formVisible = ref(false);
const isEdit = ref(false);
const formState = ref<any>({});

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    admin: 'purple',
    inspector: 'blue',
    monitor: 'orange'
  };
  return colorMap[role] || 'default';
};

const columns: ColumnType[] = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '角色', dataIndex: 'role', key: 'role', width: 120 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const data = await getUsers({ role: filterRole.value });
    users.value = data;
  } catch (error) {
    console.error('加载用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const showAddModal = () => {
  isEdit.value = false;
  formState.value = {
    username: '',
    name: '',
    password: '',
    role: 'inspector',
    phone: ''
  };
  formVisible.value = true;
};

const showEditModal = (record: User) => {
  isEdit.value = true;
  formState.value = {
    ...record,
    password: ''
  };
  formVisible.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      const updateData: any = { ...formState.value };
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateUser(formState.value.id, updateData);
      message.success('更新成功');
    } else {
      await createUser(formState.value);
      message.success('创建成功');
    }
    formVisible.value = false;
    loadData();
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.users {
  width: 100%;
}
</style>
