import User from './User';
import HazardPoint from './HazardPoint';
import RiskLevelLog from './RiskLevelLog';
import InspectionTask from './InspectionTask';
import InspectionRecord from './InspectionRecord';
import Warning from './Warning';
import ThresholdConfig from './ThresholdConfig';

User.hasMany(InspectionTask, { foreignKey: 'inspectorId', as: 'assignedTasks' });
User.hasMany(InspectionTask, { foreignKey: 'createdById', as: 'createdTasks' });
User.hasMany(InspectionRecord, { foreignKey: 'inspectorId', as: 'inspectionRecords' });
User.hasMany(RiskLevelLog, { foreignKey: 'operatorId', as: 'riskLevelLogs' });
User.hasMany(Warning, { foreignKey: 'confirmedById', as: 'confirmedWarnings' });
User.hasMany(Warning, { foreignKey: 'responderId', as: 'respondedWarnings' });

HazardPoint.hasMany(RiskLevelLog, { foreignKey: 'hazardPointId', as: 'riskLevelLogs' });
HazardPoint.hasMany(InspectionRecord, { foreignKey: 'hazardPointId', as: 'inspectionRecords' });
HazardPoint.hasMany(Warning, { foreignKey: 'hazardPointId', as: 'warnings' });

InspectionTask.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });
InspectionTask.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
InspectionTask.hasMany(InspectionRecord, { foreignKey: 'taskId', as: 'records' });

InspectionRecord.belongsTo(InspectionTask, { foreignKey: 'taskId', as: 'task' });
InspectionRecord.belongsTo(HazardPoint, { foreignKey: 'hazardPointId', as: 'hazardPoint' });
InspectionRecord.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });

RiskLevelLog.belongsTo(HazardPoint, { foreignKey: 'hazardPointId', as: 'hazardPoint' });
RiskLevelLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

Warning.belongsTo(HazardPoint, { foreignKey: 'hazardPointId', as: 'hazardPoint' });
Warning.belongsTo(User, { foreignKey: 'confirmedById', as: 'confirmer' });
Warning.belongsTo(User, { foreignKey: 'responderId', as: 'responder' });

export {
  User,
  HazardPoint,
  RiskLevelLog,
  InspectionTask,
  InspectionRecord,
  Warning,
  ThresholdConfig
};
