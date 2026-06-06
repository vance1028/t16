export type UserRole = 'admin' | 'inspector' | 'monitor';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
}

export type HazardType = 'landslide' | 'collapse' | 'debris_flow' | 'subsidence';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type ThreatTarget = 'mine_tunnel' | 'highway' | 'residential_area';

export interface HazardPoint {
  id: number;
  code: string;
  name: string;
  type: HazardType;
  latitude: number;
  longitude: number;
  miningArea: string;
  threatTarget: ThreatTarget;
  riskLevel: RiskLevel;
  description?: string;
  historicalRecords?: string;
  createdAt: string;
  updatedAt: string;
  riskLevelLogs?: RiskLevelLog[];
}

export interface RiskLevelLog {
  id: number;
  hazardPointId: number;
  oldLevel: RiskLevel;
  newLevel: RiskLevel;
  reason: string;
  operatorId: number;
  operator?: User;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface InspectionTask {
  id: number;
  code: string;
  title: string;
  inspectorId: number;
  inspector?: User;
  creator?: User;
  hazardPointIds: number[];
  hazardPoints?: HazardPoint[];
  checkItems: string[];
  deadline: string;
  status: TaskStatus;
  frequency: string;
  createdById: number;
  remark?: string;
  records?: InspectionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckResult {
  item: string;
  value: string;
  isAbnormal: boolean;
}

export interface InspectionRecord {
  id: number;
  taskId: number;
  hazardPointId: number;
  hazardPoint?: HazardPoint;
  inspectorId: number;
  inspector?: User;
  checkResults: CheckResult[];
  photos: string[];
  overallConclusion: string;
  weatherCondition?: string;
  inspectionTime: string;
  triggeredUpgrade: boolean;
  remark?: string;
  createdAt: string;
}

export type WarningStatus = 'pending' | 'confirmed' | 'responding' | 'closed';
export type ResponseAction = 'evacuation' | 'road_closure' | 'warning_set' | 'other';

export interface Warning {
  id: number;
  code: string;
  hazardPointId: number;
  hazardPoint?: HazardPoint;
  riskLevel: RiskLevel;
  triggerReason: string;
  status: WarningStatus;
  confirmedById?: number;
  confirmer?: User;
  confirmedAt?: string;
  responseActions?: ResponseAction[];
  responseDescription?: string;
  responderId?: number;
  responder?: User;
  closedAt?: string;
  closeRemark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThresholdConfig {
  id: number;
  hazardType: HazardType;
  checkItem: string;
  thresholdValue: string;
  unit: string;
  targetLevel: RiskLevel;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPoints: number;
  highRiskPoints: number;
  activeWarnings: number;
  pendingTasks: number;
  completionRate: number;
  riskLevelStats: Array<{ riskLevel: RiskLevel; count: number }>;
  typeStats: Array<{ type: HazardType; count: number }>;
  miningAreaStats: Array<{ miningArea: string; count: number }>;
}

export const HazardTypeLabels: Record<HazardType, string> = {
  landslide: '滑坡',
  collapse: '崩塌',
  debris_flow: '泥石流',
  subsidence: '地面塌陷'
};

export const RiskLevelLabels: Record<RiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  extreme: '极高'
};

export const RiskLevelColors: Record<RiskLevel, string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#fa8c16',
  extreme: '#f5222d'
};

export const ThreatTargetLabels: Record<ThreatTarget, string> = {
  mine_tunnel: '矿道',
  highway: '公路',
  residential_area: '居民区'
};

export const TaskStatusLabels: Record<TaskStatus, string> = {
  pending: '待巡查',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '超期未巡'
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  pending: 'blue',
  in_progress: 'processing',
  completed: 'success',
  overdue: 'error'
};

export const WarningStatusLabels: Record<WarningStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  responding: '处置中',
  closed: '已关闭'
};

export const WarningStatusColors: Record<WarningStatus, string> = {
  pending: 'warning',
  confirmed: 'processing',
  responding: 'error',
  closed: 'default'
};

export const ResponseActionLabels: Record<ResponseAction, string> = {
  evacuation: '通知撤离',
  road_closure: '封路',
  warning_set: '设警戒',
  other: '其他措施'
};

export const UserRoleLabels: Record<UserRole, string> = {
  admin: '管理员',
  inspector: '巡查员',
  monitor: '监控值班员'
};
