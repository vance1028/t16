<template>
  <div class="inspection-tasks">
    <div class="page-header">
      <h2 class="page-title">巡查任务</h2>
      <a-space>
        <a-select
          v-model:value="filterStatus"
          placeholder="任务状态"
          style="width: 120px"
          allow-clear
          @change="loadData"
        >
          <a-select-option value="pending">待巡查</a-select-option>
          <a-select-option value="in_progress">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="overdue">超期未巡</a-select-option>
        </a-select>
        <a-button v-if="isAdmin" type="primary" @click="showAddModal">
          <PlusOutlined /> 派发任务
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="tasks"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="TaskStatusColors[record.status]">
            {{ TaskStatusLabels[record.status] }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'deadline'">
          {{ formatTime(record.deadline) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="isInspector && record.inspectorId === currentUserId && record.status === 'pending'"
              type="link"
              size="small"
              @click="handleStart(record.id)"
            >
              开始巡查
            </a-button>
            <a-button
              v-if="isInspector && record.inspectorId === currentUserId && record.status === 'in_progress'"
              type="link"
              size="small"
              @click="showSubmitModal(record)"
            >
              提交记录
            </a-button>
            <a-button v-if="isAdmin" type="link" size="small" @click="showEditModal(record)">
              编辑
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="formVisible"
      :title="isEdit ? '编辑巡查任务' : '派发巡查任务'"
      @ok="handleSubmit"
      @cancel="formVisible = false"
      :confirm-loading="submitting"
      width="700px"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="任务标题" required>
          <a-input v-model:value="formState.title" placeholder="请输入任务标题" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="巡查员" required>
              <a-select v-model:value="formState.inspectorId" placeholder="请选择巡查员">
                <a-select-option
                  v-for="inspector in inspectors"
                  :key="inspector.id"
                  :value="inspector.id"
                >
                  {{ inspector.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止时间" required>
              <a-date-picker
                v-model:value="formState.deadline"
                show-time
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="巡查频率" required>
          <a-select v-model:value="formState.frequency" placeholder="请选择巡查频率">
            <a-select-option value="每日">每日</a-select-option>
            <a-select-option value="每周">每周</a-select-option>
            <a-select-option value="每月">每月</a-select-option>
            <a-select-option value="专项">专项</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡查隐患点" required>
          <a-select
            v-model:value="formState.hazardPointIds"
            mode="multiple"
            placeholder="请选择隐患点"
            style="width: 100%"
          >
            <a-select-option
              v-for="point in hazardPoints"
              :key="point.id"
              :value="point.id"
            >
              {{ point.code }} - {{ point.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡查项目" required>
          <a-select
            v-model:value="formState.checkItems"
            mode="tags"
            placeholder="可输入或选择巡查项目"
            style="width: 100%"
          >
            <a-select-option value="裂缝宽度测量">裂缝宽度测量</a-select-option>
            <a-select-option value="位移监测">位移监测</a-select-option>
            <a-select-option value="渗水情况检查">渗水情况检查</a-select-option>
            <a-select-option value="周边环境变化">周边环境变化</a-select-option>
            <a-select-option value="照片记录">照片记录</a-select-option>
            <a-select-option value="落石记录">落石记录</a-select-option>
            <a-select-option value="水位监测">水位监测</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="formState.remark"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="submitVisible"
      title="提交巡查记录"
      @ok="handleSubmitRecord"
      @cancel="submitVisible = false"
      :confirm-loading="submitting"
      width="700px"
    >
      <a-form :model="recordForm" layout="vertical">
        <a-form-item label="隐患点" required>
          <a-select v-model:value="recordForm.hazardPointId" placeholder="请选择隐患点">
            <a-select-option
              v-for="point in currentTask?.hazardPoints || []"
              :key="point.id"
              :value="point.id"
            >
              {{ point.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-divider>巡查项目</a-divider>
        <div v-for="(item, index) in recordForm.checkResults" :key="index" style="margin-bottom: 12px">
          <a-row :gutter="8">
            <a-col :span="6">
              <a-input v-model:value="item.item" placeholder="检查项目" :disabled="!!item.item" />
            </a-col>
            <a-col :span="10">
              <a-input v-model:value="item.value" placeholder="检查结果" />
            </a-col>
            <a-col :span="6">
              <a-switch
                v-model:checked="item.isAbnormal"
                checked-children="异常"
                un-checked-children="正常"
              />
            </a-col>
            <a-col :span="2">
              <a-button
                v-if="recordForm.checkResults.length > 1"
                type="text"
                danger
                @click="removeCheckItem(index)"
              >
                <DeleteOutlined />
              </a-button>
            </a-col>
          </a-row>
        </div>
        <a-button type="dashed" block @click="addCheckItem" style="margin-bottom: 16px">
          <PlusOutlined /> 添加检查项
        </a-button>
        <a-form-item label="总体结论" required>
          <a-textarea
            v-model:value="recordForm.overallConclusion"
            :rows="3"
            placeholder="请输入总体巡查结论"
          />
        </a-form-item>
        <a-form-item label="天气情况">
          <a-input v-model:value="recordForm.weatherCondition" placeholder="例如：晴、多云、小雨" />
        </a-form-item>
        <a-form-item label="照片上传">
          <a-upload
            list-type="picture-card"
            :file-list="recordForm.photos.map((url, i) => ({ uid: i, url, name: `照片${i+1}` }))"
            @preview="handlePreview"
          >
            <PlusOutlined />
          </a-upload>
        </a-form-item>
        <a-form-item label="是否触发升级">
          <a-switch
            v-model:checked="recordForm.triggeredUpgrade"
            checked-children="是"
            un-checked-children="否"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:open="detailVisible"
      title="巡查任务详情"
      :width="720"
    >
      <a-descriptions v-if="currentTask" :column="2" bordered size="small">
        <a-descriptions-item label="任务编号">
          {{ currentTask.code }}
        </a-descriptions-item>
        <a-descriptions-item label="任务标题">
          {{ currentTask.title }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="TaskStatusColors[currentTask.status]">
            {{ TaskStatusLabels[currentTask.status] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="巡查频率">
          {{ currentTask.frequency }}
        </a-descriptions-item>
        <a-descriptions-item label="巡查员">
          {{ currentTask.inspector?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="派发人">
          {{ currentTask.creator?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="截止时间">
          {{ formatTime(currentTask.deadline) }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatTime(currentTask.createdAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="巡查隐患点" :span="2">
          <a-tag v-for="point in currentTask.hazardPoints" :key="point.id" style="margin: 2px">
            {{ point.name }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="巡查项目" :span="2">
          <a-tag v-for="item in currentTask.checkItems" :key="item" color="blue" style="margin: 2px">
            {{ item }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTask.remark" label="备注" :span="2">
          {{ currentTask.remark }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>巡查记录</a-divider>
      <a-timeline v-if="records.length > 0">
        <a-timeline-item v-for="record in records" :key="record.id">
          <p>
            <strong>{{ record.hazardPoint?.name }}</strong>
            <span style="margin-left: 12px; color: #999">
              {{ formatTime(record.inspectionTime) }}
            </span>
          </p>
          <p>结论: {{ record.overallConclusion }}</p>
          <div v-if="record.checkResults && record.checkResults.length > 0">
            <a-tag
              v-for="(result, idx) in record.checkResults"
              :key="idx"
              :color="result.isAbnormal ? 'red' : 'green'"
              style="margin: 2px"
            >
              {{ result.item }}: {{ result.value }}
            </a-tag>
          </div>
          <p v-if="record.triggeredUpgrade" style="color: #f5222d">
            ⚠️ 本次巡查触发风险等级升级
          </p>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无巡查记录" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';
import {
  getInspectionTasks,
  createInspectionTask,
  updateInspectionTask,
  startTask,
  submitRecord,
  getInspectionTask,
  getTaskRecords
} from '@/api/inspectionTasks';
import { getHazardPoints } from '@/api/hazardPoints';
import { getInspectors } from '@/api/users';
import type { InspectionTask, TaskStatus } from '@/types';
import {
  TaskStatusLabels,
  TaskStatusColors
} from '@/types';
import type { ColumnType } from 'ant-design-vue/es/table';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.userRole === 'admin');
const isInspector = computed(() => userStore.userRole === 'inspector');
const currentUserId = computed(() => userStore.user?.id);

const loading = ref(false);
const submitting = ref(false);
const tasks = ref<InspectionTask[]>([]);
const filterStatus = ref<TaskStatus | undefined>();

const hazardPoints = ref<any[]>([]);
const inspectors = ref<any[]>([]);

const formVisible = ref(false);
const isEdit = ref(false);
const formState = ref<any>({});

const submitVisible = ref(false);
const currentTask = ref<InspectionTask | null>(null);
const recordForm = ref({
  hazardPointId: undefined as number | undefined,
  checkResults: [{ item: '', value: '', isAbnormal: false }],
  photos: [] as string[],
  overallConclusion: '',
  weatherCondition: '',
  triggeredUpgrade: false
});

const detailVisible = ref(false);
const records = ref<any[]>([]);

const columns: ColumnType[] = [
  { title: '任务编号', dataIndex: 'code', key: 'code', width: 140 },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '巡查员', dataIndex: ['inspector', 'name'], key: 'inspector', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 170 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
];

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const loadData = async () => {
  loading.value = true;
  try {
    const data = await getInspectionTasks({ status: filterStatus.value });
    tasks.value = data;
  } catch (error) {
    console.error('加载巡查任务失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadHazardPointsAndInspectors = async () => {
  try {
    const [points, users] = await Promise.all([
      getHazardPoints(),
      getInspectors()
    ]);
    hazardPoints.value = points;
    inspectors.value = users;
  } catch (error) {
    console.error('加载基础数据失败:', error);
  }
};

const showAddModal = () => {
  isEdit.value = false;
  formState.value = {
    title: '',
    inspectorId: undefined,
    deadline: null,
    frequency: '每日',
    hazardPointIds: [],
    checkItems: [],
    remark: ''
  };
  formVisible.value = true;
};

const showEditModal = (record: InspectionTask) => {
  isEdit.value = true;
  formState.value = {
    ...record,
    deadline: dayjs(record.deadline)
  };
  formVisible.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = {
      ...formState.value,
      deadline: formState.value.deadline ? formState.value.deadline.toISOString() : undefined
    };
    if (isEdit.value) {
      await updateInspectionTask(formState.value.id, data);
      message.success('更新成功');
    } else {
      await createInspectionTask(data);
      message.success('派发成功');
    }
    formVisible.value = false;
    loadData();
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    submitting.value = false;
  }
};

const handleStart = async (id: number) => {
  try {
    await startTask(id);
    message.success('任务已开始');
    loadData();
  } catch (error) {
    console.error('开始任务失败:', error);
  }
};

const showSubmitModal = async (record: InspectionTask) => {
  try {
    const taskDetail = await getInspectionTask(record.id);
    currentTask.value = taskDetail;
    recordForm.value = {
      hazardPointId: taskDetail.hazardPoints?.[0]?.id,
      checkResults: taskDetail.checkItems.map(item => ({ item, value: '', isAbnormal: false })),
      photos: [],
      overallConclusion: '',
      weatherCondition: '',
      triggeredUpgrade: false
    };
    submitVisible.value = true;
  } catch (error) {
    console.error('加载任务详情失败:', error);
  }
};

const addCheckItem = () => {
  recordForm.value.checkResults.push({ item: '', value: '', isAbnormal: false });
};

const removeCheckItem = (index: number) => {
  recordForm.value.checkResults.splice(index, 1);
};

const handleSubmitRecord = async () => {
  if (!currentTask.value) return;
  submitting.value = true;
  try {
    await submitRecord(currentTask.value.id, recordForm.value as any);
    message.success('提交成功');
    submitVisible.value = false;
    loadData();
  } catch (error) {
    console.error('提交记录失败:', error);
  } finally {
    submitting.value = false;
  }
};

const viewDetail = async (record: InspectionTask) => {
  try {
    const [taskDetail, taskRecords] = await Promise.all([
      getInspectionTask(record.id),
      getTaskRecords(record.id)
    ]);
    currentTask.value = taskDetail;
    records.value = taskRecords;
  } catch (error) {
    console.error('加载详情失败:', error);
  }
  detailVisible.value = true;
};

const handlePreview = () => {};

onMounted(() => {
  loadData();
  loadHazardPointsAndInspectors();
});
</script>

<style scoped>
.inspection-tasks {
  width: 100%;
}
</style>
