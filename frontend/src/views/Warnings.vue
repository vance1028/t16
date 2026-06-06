<template>
  <div class="warnings">
    <div class="page-header">
      <h2 class="page-title">预警工作台</h2>
      <a-space>
        <a-select
          v-model:value="filterStatus"
          placeholder="预警状态"
          style="width: 120px"
          allow-clear
          @change="loadData"
        >
          <a-select-option value="pending">待确认</a-select-option>
          <a-select-option value="confirmed">已确认</a-select-option>
          <a-select-option value="responding">处置中</a-select-option>
          <a-select-option value="closed">已关闭</a-select-option>
        </a-select>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="warnings"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'riskLevel'">
          <a-tag :color="RiskLevelColors[record.riskLevel]">
            {{ RiskLevelLabels[record.riskLevel] }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="WarningStatusColors[record.status]">
            {{ WarningStatusLabels[record.status] }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="record.status === 'pending'"
              type="link"
              size="small"
              @click="handleConfirm(record.id)"
            >
              确认
            </a-button>
            <a-button
              v-if="['pending', 'confirmed'].includes(record.status)"
              type="link"
              size="small"
              @click="showResponseModal(record)"
            >
              启动响应
            </a-button>
            <a-button
              v-if="record.status === 'responding'"
              type="link"
              size="small"
              @click="showCloseModal(record)"
            >
              关闭预警
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="responseVisible"
      title="启动应急响应"
      @ok="handleStartResponse"
      @cancel="responseVisible = false"
      :confirm-loading="submitting"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="响应措施" required>
          <a-checkbox-group v-model:value="responseForm.responseActions">
            <a-checkbox value="evacuation">通知撤离</a-checkbox>
            <a-checkbox value="road_closure">封路</a-checkbox>
            <a-checkbox value="warning_set">设警戒</a-checkbox>
            <a-checkbox value="other">其他措施</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="响应说明" required>
          <a-textarea
            v-model:value="responseForm.responseDescription"
            :rows="4"
            placeholder="请详细描述应急响应措施和执行情况"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="closeVisible"
      title="关闭预警"
      @ok="handleCloseWarning"
      @cancel="closeVisible = false"
      :confirm-loading="submitting"
    >
      <a-form layout="vertical">
        <a-form-item label="关闭说明" required>
          <a-textarea
            v-model:value="closeForm.closeRemark"
            :rows="4"
            placeholder="请说明关闭预警的原因和处置结果"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:open="detailVisible"
      title="预警详情"
      :width="640"
    >
      <a-descriptions v-if="currentWarning" :column="2" bordered size="small">
        <a-descriptions-item label="预警编号">
          {{ currentWarning.code }}
        </a-descriptions-item>
        <a-descriptions-item label="风险等级">
          <a-tag :color="RiskLevelColors[currentWarning.riskLevel]">
            {{ RiskLevelLabels[currentWarning.riskLevel] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="WarningStatusColors[currentWarning.status]">
            {{ WarningStatusLabels[currentWarning.status] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="隐患点">
          {{ currentWarning.hazardPoint?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="触发原因" :span="2">
          {{ currentWarning.triggerReason }}
        </a-descriptions-item>
        <a-descriptions-item label="确认人">
          {{ currentWarning.confirmer?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="确认时间">
          {{ currentWarning.confirmedAt ? formatTime(currentWarning.confirmedAt) : '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="响应措施" :span="2" v-if="currentWarning.responseActions">
          <a-tag
            v-for="action in currentWarning.responseActions"
            :key="action"
            color="orange"
            style="margin: 2px"
          >
            {{ ResponseActionLabels[action] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="响应说明" :span="2" v-if="currentWarning.responseDescription">
          {{ currentWarning.responseDescription }}
        </a-descriptions-item>
        <a-descriptions-item label="处置人" v-if="currentWarning.responder">
          {{ currentWarning.responder.name }}
        </a-descriptions-item>
        <a-descriptions-item label="关闭时间" v-if="currentWarning.closedAt">
          {{ formatTime(currentWarning.closedAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="关闭说明" :span="2" v-if="currentWarning.closeRemark">
          {{ currentWarning.closeRemark }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">
          {{ formatTime(currentWarning.createdAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  getWarnings,
  confirmWarning,
  startResponse,
  closeWarning
} from '@/api/warnings';
import type { Warning, WarningStatus, ResponseAction } from '@/types';
import {
  RiskLevelLabels,
  RiskLevelColors,
  WarningStatusLabels,
  WarningStatusColors,
  ResponseActionLabels
} from '@/types';
import type { ColumnType } from 'ant-design-vue/es/table';

const loading = ref(false);
const submitting = ref(false);
const warnings = ref<Warning[]>([]);
const filterStatus = ref<WarningStatus | undefined>();

const detailVisible = ref(false);
const currentWarning = ref<Warning | null>(null);

const responseVisible = ref(false);
const responseForm = ref({
  responseActions: [] as ResponseAction[],
  responseDescription: ''
});

const closeVisible = ref(false);
const closeForm = ref({
  closeRemark: ''
});

const columns: ColumnType[] = [
  { title: '预警编号', dataIndex: 'code', key: 'code', width: 140 },
  { title: '隐患点', dataIndex: ['hazardPoint', 'name'], key: 'hazardPoint' },
  { title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '触发原因', dataIndex: 'triggerReason', key: 'triggerReason', ellipsis: true },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
];

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const loadData = async () => {
  loading.value = true;
  try {
    const data = await getWarnings({ status: filterStatus.value });
    warnings.value = data;
  } catch (error) {
    console.error('加载预警失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleConfirm = async (id: number) => {
  try {
    await confirmWarning(id);
    message.success('预警已确认');
    loadData();
  } catch (error) {
    console.error('确认预警失败:', error);
  }
};

const showResponseModal = (record: Warning) => {
  currentWarning.value = record;
  responseForm.value = {
    responseActions: [],
    responseDescription: ''
  };
  responseVisible.value = true;
};

const handleStartResponse = async () => {
  if (!currentWarning.value) return;
  submitting.value = true;
  try {
    await startResponse(currentWarning.value.id, responseForm.value);
    message.success('应急响应已启动');
    responseVisible.value = false;
    loadData();
  } catch (error) {
    console.error('启动响应失败:', error);
  } finally {
    submitting.value = false;
  }
};

const showCloseModal = (record: Warning) => {
  currentWarning.value = record;
  closeForm.value = {
    closeRemark: ''
  };
  closeVisible.value = true;
};

const handleCloseWarning = async () => {
  if (!currentWarning.value) return;
  submitting.value = true;
  try {
    await closeWarning(currentWarning.value.id, closeForm.value);
    message.success('预警已关闭');
    closeVisible.value = false;
    loadData();
  } catch (error) {
    console.error('关闭预警失败:', error);
  } finally {
    submitting.value = false;
  }
};

const viewDetail = (record: Warning) => {
  currentWarning.value = record;
  detailVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.warnings {
  width: 100%;
}
</style>
