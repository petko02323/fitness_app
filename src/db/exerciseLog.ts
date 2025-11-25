import {DataTypes, Model, Sequelize} from 'sequelize'
import {EXERCISE_STATE} from "../utils/enums";

export interface ExerciseLogModel extends Model {
  id: number
  userID: number
  exerciseID: number
  state: EXERCISE_STATE
  duration: number
  timestamp: Date
}

export default (sequelize: Sequelize, modelName: string) => {
  return sequelize.define<ExerciseLogModel>(
      modelName,
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
        },
        userId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: "users",
            key: "id"
          },
          onDelete: "CASCADE"
        },
        exerciseId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: "exercises",
            key: "id"
          },
          onDelete: "CASCADE"
        },
        state: {
          type: DataTypes.ENUM(...Object.values(EXERCISE_STATE)),
          defaultValue: EXERCISE_STATE.NOT_STARTED
        },
        duration: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        paranoid: true,
        timestamps: true,
        tableName: 'exercise_logs'
      }
  )
}