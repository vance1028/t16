<template>
  <div class="dashboard">
    <a-row :gutter="[16, 16]">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="隐患点总数"
            :value="stats.totalPoints"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <EnvironmentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="高风险隐患点"
            :value="stats.highRiskPoints"
            :value-style="{ color: '#f5222d' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="活跃预警"
            :value="stats.activeWarnings"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="巡查完成率"
            :value="stats.completionRate"
            suffix="%"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :span="16">
        <a-card title="隐患点分布地图" class="map-card">
          <div class="map-container">
            <div
              v-for="point in mapPoints"
              :key="point.id"
              class="map-marker"
              :style="{
                left: `${((point.longitude - 113.6) * 800 + 50)}px`,
                top: `${((34.8 - point.latitude) * 800 + 50)}px`,
                backgroundColor: getRiskColor(point.riskLevel)
              }"
              @click="showPointDetail(point)"
            >
              <a-tooltip>
                <template #title>
                  <div>
                    <p><strong>{{ point.name }}</strong></p>
                    <p>类型: {{ HazardTypeLabels[point.type] }}</p>
                    <p>风险等级: {{ RiskLevelLabels[point.riskLevel] }}</p>
                    <p>矿区: {{ point.miningArea }}</p>
                  </div>
                </template>
                <EnvironmentOutlined style="color: #fff; font-size: 16px" />
              </a-tooltip>
            </div>
            <div class="map-legend">
              <span v-for="(label, key) in RiskLevelLabels" :key="key" class="legend-item">
                <span class="legend-dot" :style="{ backgroundColor: RiskLevelColors[key] }"></span>
                {{ label }}风险
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="活跃预警清单" class="warning-card">
          <a-list :data-source="recentWarnings">
            <template #renderItem="{ item }">
              <a-list-item class="warning-item" @click="$router.push('/warnings')">
                <a-list-item-meta>
                  <template #title>
                    <a-space>
                      <span class="warning-code">{{ item.code }}</span>
                      <a-tag :color="getWarningTagColor(item.status)">
                        {{ WarningStatusLabels[item.status] }}
                      </a-tag>
                    </a-space>
                  </template>
                  <template #description>
                    <div>
                      <p class="warning-point">
                        {{ item.hazardPoint?.name || '未知隐患点' }}
                      </p>
                      <p class="warning-reason">{{ item.triggerReason }}</p>
                      <p class="warning-time">
                        {{ formatTime(item.createdAt) }}
                      </p>
                    </div>
                  </template>
                  <template #avatar>
                    <a-avatar
                      :style="{ backgroundColor: RiskLevelColors[item.riskLevel] }"
                    >
                      <WarningOutlined />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
            <template #empty>
              <a-empty description="暂无活跃预警" />
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :span="8">
        <a-card title="风险等级分布">
          <div ref="riskChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="隐患类型分布">
          <div ref="typeChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="各矿区巡查完成率">
          <div ref="areaChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      v-model:open="detailVisible"
      title="隐患点详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions v-if="selectedPoint" :column="2" bordered size="small">
        <a-descriptions-item label="编号">
          {{ selectedPoint.code }}
        </a-descriptions-item>
        <a-descriptions-item label="名称">
          {{ selectedPoint.name }}
        </a-descriptions-item>
        <a-descriptions-item label="类型">
          {{ HazardTypeLabels[selectedPoint.type] }}
        </a-descriptions-item>
        <a-descriptions-item label="风险等级">
          <a-tag :color="RiskLevelColors[selectedPoint.riskLevel]">
            {{ RiskLevelLabels[selectedPoint.riskLevel] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所在矿区">
          {{ selectedPoint.miningArea }}
        </a-descriptions-item>
        <a-descriptions-item label="威胁对象">
          {{ ThreatTargetLabels[selectedPoint.threatTarget] }}
        </a-descriptions-item>
        <a-descriptions-item label="坐标">
          {{ selectedPoint.longitude }}, {{ selectedPoint.latitude }}
        </a-descriptions-item>
        <a-descriptions-item label="编号">
          {{ selectedPoint.code }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import {
  getDashboardStats,
  getMapPoints,
  getRecentWarnings,
  getMiningAreaCompletion
} from '@/api/dashboard';
import type { DashboardStats, HazardPoint, Warning } from '@/types';
import {
  HazardTypeLabels,
  RiskLevelLabels,
  RiskLevelColors,
  ThreatTargetLabels,
  WarningStatusLabels
} from '@/types';

const stats = ref<DashboardStats>({
  totalPoints: 0,
  highRiskPoints: 0,
  activeWarnings: 0,
  completionRate: 0,
  riskLevelStats: [],
  typeStats: [],
  miningAreaStats: []
});

const mapPoints = ref<HazardPoint[]>([]);
const recentWarnings = ref<Warning[]>([]);
const detailVisible = ref(false);
const selectedPoint = ref<HazardPoint | null>(null);

const riskChartRef = ref<HTMLElement | null>(null);
const typeChartRef = ref<HTMLElement | null>(null);
const areaChartRef = ref<HTMLElement | null>(null);

const getRiskColor = (level: string) => RiskLevelColors[level as keyof typeof RiskLevelColors] || '#999';

const getWarningTagColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'gold',
    confirmed: 'blue',
    responding: 'red',
    closed: 'default'
  };
  return colorMap[status] || 'default';
};

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const showPointDetail = (point: HazardPoint) => {
  selectedPoint.value = point;
  detailVisible.value = true;
};

const initRiskChart = () => {
  if (!riskChartRef.value) return;
  const chart = echarts.init(riskChartRef.value);
  const data = stats.value.riskLevelStats.map(item => ({
    name: RiskLevelLabels[item.riskLevel],
    value: (item as any).count || 0
  }));
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data,
      color: ['#52c41a', '#faad14', '#fa8c16', '#f5222d'],
      label: {
        formatter: '{b}: {c}'
      }
    }]
  });
};

const initTypeChart = () => {
  if (!typeChartRef.value) return;
  const chart = echarts.init(typeChartRef.value);
  const data = stats.value.typeStats.map(item => ({
    name: HazardTypeLabels[item.type],
    value: (item as any).count || 0
  }));
  chart.setOption({
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#69c0ff' }
        ])
      }
    }]
  });
};

const initAreaChart = async () => {
  if (!areaChartRef.value) return;
  try {
    const data = await getMiningAreaCompletion();
    const chart = echarts.init(areaChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map(d => d.miningArea)
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.completionRate),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#95de64' }
          ])
        }
      }]
    });
  } catch (error) {
    console.error('加载矿区完成率失败:', error);
  }
};

const loadData = async () => {
  try {
    const [statsData, points, warnings] = await Promise.all([
      getDashboardStats(),
      getMapPoints(),
      getRecentWarnings()
    ]);
    stats.value = statsData;
    mapPoints.value = points;
    recentWarnings.value = warnings;

    await nextTick();
    initRiskChart();
    initTypeChart();
    initAreaChart();
  } catch (error) {
    console.error('加载看板数据失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-card {
  height: 400px;
}

.map-container {
  position: relative;
  height: 320px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 8px;
  overflow: hidden;
}

.map-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  z-index: 1;
}

.map-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 10;
}

.map-legend {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.warning-card {
  height: 400px;
}

.warning-item {
  cursor: pointer;
  transition: background 0.2s;
}

.warning-item:hover {
  background: #f5f5f5;
}

.warning-code {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.warning-point {
  color: rgba(0, 0, 0, 0.65);
  margin: 4px 0;
}

.warning-reason {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  margin: 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.warning-time {
  color: rgba(0, 0, 0, 0.35);
  font-size: 12px;
  margin: 4px 0;
}
</style>
