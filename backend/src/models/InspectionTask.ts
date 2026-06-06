import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface IInspectionTask {
  id?: number;
  code: string;
  title: string;
  inspectorId: number;
  hazardPointIds: number[];
  checkItems: string[];
  deadline: Date;
  status: TaskStatus;
  frequency: string;
  createdById: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class InspectionTask extends Model<IInspectionTask> implements IInspectionTask {
  public id!: number;
  public code!: string;
  public title!: string;
  public inspectorId!: number;
  public hazardPointIds!: number[];
  public checkItems!: string[];
  public deadline!: Date;
  public status!: TaskStatus;
  public frequency!: string;
  public createdById!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InspectionTask.init(
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    inspectorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    hazardPointIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    checkItems: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
      allowNull: false,
      defaultValue: 'pending'
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    remark: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'inspection_tasks'
  }
);

export default InspectionTask;
