import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { RiskLevel } from './HazardPoint';

export interface IRiskLevelLog {
  id?: number;
  hazardPointId: number;
  oldLevel: RiskLevel;
  newLevel: RiskLevel;
  reason: string;
  operatorId: number;
  createdAt?: Date;
}

class RiskLevelLog extends Model<IRiskLevelLog> implements IRiskLevelLog {
  public id!: number;
  public hazardPointId!: number;
  public oldLevel!: RiskLevel;
  public newLevel!: RiskLevel;
  public reason!: string;
  public operatorId!: number;
  public readonly createdAt!: Date;
}

RiskLevelLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hazardPointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hazard_points',
        key: 'id'
      }
    },
    oldLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false
    },
    newLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'risk_level_logs',
    updatedAt: false
  }
);

export default RiskLevelLog;
