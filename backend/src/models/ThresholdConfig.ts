import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { HazardType, RiskLevel } from './HazardPoint';

export interface IThresholdConfig {
  id?: number;
  hazardType: HazardType;
  checkItem: string;
  thresholdValue: string;
  unit: string;
  targetLevel: RiskLevel;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class ThresholdConfig extends Model<IThresholdConfig> implements IThresholdConfig {
  public id!: number;
  public hazardType!: HazardType;
  public checkItem!: string;
  public thresholdValue!: string;
  public unit!: string;
  public targetLevel!: RiskLevel;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ThresholdConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hazardType: {
      type: DataTypes.ENUM('landslide', 'collapse', 'debris_flow', 'subsidence'),
      allowNull: false
    },
    checkItem: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    thresholdValue: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    targetLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'threshold_configs'
  }
);

export default ThresholdConfig;
