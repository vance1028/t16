import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { RiskLevel } from './HazardPoint';

export type WarningStatus = 'pending' | 'confirmed' | 'responding' | 'closed';
export type ResponseAction = 'evacuation' | 'road_closure' | 'warning_set' | 'other';

export interface IWarning {
  id?: number;
  code: string;
  hazardPointId: number;
  riskLevel: RiskLevel;
  triggerReason: string;
  status: WarningStatus;
  confirmedById?: number;
  confirmedAt?: Date;
  responseActions?: ResponseAction[];
  responseDescription?: string;
  responderId?: number;
  closedAt?: Date;
  closeRemark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Warning extends Model<IWarning> implements IWarning {
  public id!: number;
  public code!: string;
  public hazardPointId!: number;
  public riskLevel!: RiskLevel;
  public triggerReason!: string;
  public status!: WarningStatus;
  public confirmedById?: number;
  public confirmedAt?: Date;
  public responseActions?: ResponseAction[];
  public responseDescription?: string;
  public responderId?: number;
  public closedAt?: Date;
  public closeRemark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Warning.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    hazardPointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hazard_points',
        key: 'id'
      }
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false
    },
    triggerReason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'responding', 'closed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    confirmedById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    confirmedAt: {
      type: DataTypes.DATE
    },
    responseActions: {
      type: DataTypes.ARRAY(DataTypes.ENUM('evacuation', 'road_closure', 'warning_set', 'other'))
    },
    responseDescription: {
      type: DataTypes.TEXT
    },
    responderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    closedAt: {
      type: DataTypes.DATE
    },
    closeRemark: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'warnings'
  }
);

export default Warning;
