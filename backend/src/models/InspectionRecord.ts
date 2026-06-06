import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ICheckResult {
  item: string;
  value: string;
  isAbnormal: boolean;
}

export interface IInspectionRecord {
  id?: number;
  taskId: number;
  hazardPointId: number;
  inspectorId: number;
  checkResults: ICheckResult[];
  photos: string[];
  overallConclusion: string;
  weatherCondition?: string;
  inspectionTime: Date;
  triggeredUpgrade: boolean;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class InspectionRecord extends Model<IInspectionRecord> implements IInspectionRecord {
  public id!: number;
  public taskId!: number;
  public hazardPointId!: number;
  public inspectorId!: number;
  public checkResults!: ICheckResult[];
  public photos!: string[];
  public overallConclusion!: string;
  public weatherCondition?: string;
  public inspectionTime!: Date;
  public triggeredUpgrade!: boolean;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InspectionRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inspection_tasks',
        key: 'id'
      }
    },
    hazardPointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hazard_points',
        key: 'id'
      }
    },
    inspectorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    checkResults: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    overallConclusion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    weatherCondition: {
      type: DataTypes.STRING(100)
    },
    inspectionTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    triggeredUpgrade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    remark: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'inspection_records'
  }
);

export default InspectionRecord;
