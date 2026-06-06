import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type HazardType = 'landslide' | 'collapse' | 'debris_flow' | 'subsidence';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type ThreatTarget = 'mine_tunnel' | 'highway' | 'residential_area';

export interface IHazardPoint {
  id?: number;
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
  createdAt?: Date;
  updatedAt?: Date;
}

class HazardPoint extends Model<IHazardPoint> implements IHazardPoint {
  public id!: number;
  public code!: string;
  public name!: string;
  public type!: HazardType;
  public latitude!: number;
  public longitude!: number;
  public miningArea!: string;
  public threatTarget!: ThreatTarget;
  public riskLevel!: RiskLevel;
  public description?: string;
  public historicalRecords?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HazardPoint.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('landslide', 'collapse', 'debris_flow', 'subsidence'),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false
    },
    miningArea: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    threatTarget: {
      type: DataTypes.ENUM('mine_tunnel', 'highway', 'residential_area'),
      allowNull: false
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false,
      defaultValue: 'medium'
    },
    description: {
      type: DataTypes.TEXT
    },
    historicalRecords: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'hazard_points'
  }
);

export default HazardPoint;
