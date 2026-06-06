<template>
  <div class="hazard-points">
    <div class="page-header">
      <h2 class="page-title">隐患点管理</h2>
      <a-space>
        <a-select
          v-model:value="filterMiningArea"
          placeholder="筛选矿区"
          style="width: 150px"
          allow-clear
          @change="loadData"
        >
          <a-select-option value="东山矿区">东山矿区</a-select-option>
          <a-select-option value="西山矿区">西山矿区</a-select-option>
          <a-select-option value="南山矿区">南山矿区</a-select-option>
        </a-select>
        <a-select
          v-model:value="filterRiskLevel"
          placeholder="风险等级"
          style="width: 120px"
          allow-clear
          @change="loadData"
        >
          <a-select-option value="low">低风险</a-select-option>
          <a-select-option value="medium">中风险</a-select-option>
          <a-select-option value="high">高风险</a-select-option>
          <a-select-option value="extreme">极高风险</a-select-option>
        </a-select>
        <a-button v-if="isAdmin" type="primary" @click="showAddModal">
          <PlusOutlined /> 新增隐患点
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="hazardPoints"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ HazardTypeLabels[record.type] }}
        </template>
        <template v-else-if="column.key === 'riskLevel'">
          <a-tag :color="RiskLevelColors[record.riskLevel]">
            {{ RiskLevelLabels[record.riskLevel] }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'threatTarget'">
          {{ ThreatTargetLabels[record.threatTarget] }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-button v-if="isAdmin" type="link" size="small" @click="showEditModal(record)">
              编辑
            </a-button>
            <a-button v-if="isAdmin" type="link" size="small" @click="showRiskLevelModal(record)">
              调级
            </a-button>
            <a-popconfirm
              v-if="isAdmin"
              title="确定删除此隐患点吗？"
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
      :title="isEdit ? '编辑隐患点' : '新增隐患点'"
      @ok="handleSubmit"
      @cancel="formVisible = false"
      :confirm-loading="submitting"
      width="700px"
    >
      <a-form
        :model="formState"
        layout="vertical"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编号" required>
              <a-input v-model:value="formState.code" placeholder="请输入编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model:value="formState.name" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" required>
              <a-select v-model:value="formState.type" placeholder="请选择类型">
                <a-select-option value="landslide">滑坡</a-select-option>
                <a-select-option value="collapse">崩塌</a-select-option>
                <a-select-option value="debris_flow">泥石流</a-select-option>
                <a-select-option value="subsidence">地面塌陷</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="风险等级" required>
              <a-select v-model:value="formState.riskLevel" placeholder="请选择风险等级">
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="extreme">极高</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经度" required>
              <a-input-number
                v-model:value="formState.longitude"
                :precision="6"
                style="width: 100%"
                placeholder="请输入经度"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="纬度" required>
              <a-input-number
                v-model:value="formState.latitude"
                :precision="6"
                style="width: 100%"
                placeholder="请输入纬度"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所在矿区" required>
              <a-select v-model:value="formState.miningArea" placeholder="请选择矿区">
                <a-select-option value="东山矿区">东山矿区</a-select-option>
                <a-select-option value="西山矿区">西山矿区</a-select-option>
                <a-select-option value="南山矿区">南山矿区</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="威胁对象" required>
              <a-select v-model:value="formState.threatTarget" placeholder="请选择威胁对象">
                <a-select-option value="mine_tunnel">矿道</a-select-option>
                <a-select-option value="highway">公路</a-select-option>
                <a-select-option value="residential_area">居民区</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="formState.description"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </a-form-item>
        <a-form-item label="历史灾情记录">
          <a-textarea
            v-model:value="formState.historicalRecords"
            :rows="3"
            placeholder="请输入历史灾情记录"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="riskLevelModalVisible"
      title="调整风险等级"
      @ok="handleRiskLevelUpdate"
      @cancel="riskLevelModalVisible = false"
      :confirm-loading="submitting"
    >
      <a-form layout="vertical">
        <a-form-item label="当前等级">
          <a-tag v-if="currentPoint" :color="RiskLevelColors[currentPoint.riskLevel]">
            {{ RiskLevelLabels[currentPoint.riskLevel] }}
          </a-tag>
        </a-form-item>
        <a-form-item label="调整为" required>
          <a-select v-model:value="riskLevelForm.newLevel" style="width: 100%">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="extreme">极高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调级依据" required>
          <a-textarea
            v-model:value="riskLevelForm.reason"
            :rows="3"
            placeholder="请详细说明调级依据"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:open="detailVisible"
      title="隐患点详情"
      :width="640"
    >
      <a-descriptions v-if="currentPoint" :column="2" bordered size="small">
        <a-descriptions-item label="编号">
          {{ currentPoint.code }}
        </a-descriptions-item>
        <a-descriptions-item label="名称">
          {{ currentPoint.name }}
        </a-descriptions-item>
        <a-descriptions-item label="类型">
          {{ HazardTypeLabels[currentPoint.type] }}
        </a-descriptions-item>
        <a-descriptions-item label="风险等级">
          <a-tag :color="RiskLevelColors[currentPoint.riskLevel]">
            {{ RiskLevelLabels[currentPoint.riskLevel] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所在矿区">
          {{ currentPoint.miningArea }}
        </a-descriptions-item>
        <a-descriptions-item label="威胁对象">
          {{ ThreatTargetLabels[currentPoint.threatTarget] }}
        </a-descriptions-item>
        <a-descriptions-item label="坐标" :span="2">
          {{ currentPoint.longitude }}, {{ currentPoint.latitude }}
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">
          {{ currentPoint.description || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="历史灾情" :span="2">
          {{ currentPoint.historicalRecords || '无' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>风险等级变更记录</a-divider>
      <a-timeline>
        <a-timeline-item v-for="log in riskLevelLogs" :key="log.id">
          <p>
            <a-tag :color="RiskLevelColors[log.oldLevel]">
              {{ RiskLevelLabels[log.oldLevel] }}
            </a-tag>
            →
            <a-tag :color="RiskLevelColors[log.newLevel]">
              {{ RiskLevelLabels[log.newLevel] }}
            </a-tag>
          </p>
          <p>依据: {{ log.reason }}</p>
          <p style="color: #999; font-size: 12px">
            操作人: {{ log.operator?.name || '未知' }} | {{ formatTime(log.createdAt) }}
          </p>
        </a-timeline-item>
      </a-timeline>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';
import {
  getHazardPoints,
  createHazardPoint,
  updateHazardPoint,
  deleteHazardPoint,
  updateRiskLevel,
  getHazardPoint
} from '@/api/hazardPoints';
import type { HazardPoint, RiskLevel } from '@/types';
import {
  HazardTypeLabels,
  RiskLevelLabels,
  RiskLevelColors,
  ThreatTargetLabels
} from '@/types';
import type { ColumnType } from 'ant-design-vue/es/table';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.userRole === 'admin');

const loading = ref(false);
const submitting = ref(false);
const hazardPoints = ref<HazardPoint[]>([]);
const filterMiningArea = ref<string | undefined>();
const filterRiskLevel = ref<string | undefined>();

const formVisible = ref(false);
const isEdit = ref(false);
const formState = ref<any>({});

const detailVisible = ref(false);
const currentPoint = ref<HazardPoint | null>(null);
const riskLevelLogs = ref<any[]>([]);

const riskLevelModalVisible = ref(false);
const riskLevelForm = ref({
  newLevel: 'medium' as RiskLevel,
  reason: ''
});

const columns: ColumnType[] = [
  { title: '编号', dataIndex: 'code', key: 'code', width: 100 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel', width: 100 },
  { title: '所在矿区', dataIndex: 'miningArea', key: 'miningArea', width: 120 },
  { title: '威胁对象', dataIndex: 'threatTarget', key: 'threatTarget', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
];

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const loadData = async () => {
  loading.value = true;
  try {
    const data = await getHazardPoints({
      miningArea: filterMiningArea.value,
      riskLevel: filterRiskLevel.value as RiskLevel
    });
    hazardPoints.value = data;
  } catch (error) {
    console.error('加载隐患点失败:', error);
  } finally {
    loading.value = false;
  }
};

const showAddModal = () => {
  isEdit.value = false;
  formState.value = {
    code: '',
    name: '',
    type: 'landslide',
    riskLevel: 'medium',
    longitude: 113.65,
    latitude: 34.75,
    miningArea: '东山矿区',
    threatTarget: 'mine_tunnel',
    description: '',
    historicalRecords: ''
  };
  formVisible.value = true;
};

const showEditModal = (record: HazardPoint) => {
  isEdit.value = true;
  formState.value = { ...record };
  formVisible.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateHazardPoint(formState.value.id, formState.value);
      message.success('更新成功');
    } else {
      await createHazardPoint(formState.value);
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
    await deleteHazardPoint(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const viewDetail = async (record: HazardPoint) => {
  currentPoint.value = record;
  try {
    const detail = await getHazardPoint(record.id);
    riskLevelLogs.value = detail.riskLevelLogs || [];
  } catch (error) {
    console.error('加载详情失败:', error);
  }
  detailVisible.value = true;
};

const showRiskLevelModal = (record: HazardPoint) => {
  currentPoint.value = record;
  riskLevelForm.value = {
    newLevel: record.riskLevel,
    reason: ''
  };
  riskLevelModalVisible.value = true;
};

const handleRiskLevelUpdate = async () => {
  if (!currentPoint.value) return;
  submitting.value = true;
  try {
    await updateRiskLevel(currentPoint.value.id, riskLevelForm.value);
    message.success('风险等级调整成功');
    riskLevelModalVisible.value = false;
    loadData();
  } catch (error) {
    console.error('调级失败:', error);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.hazard-points {
  width: 100%;
}
</style>
