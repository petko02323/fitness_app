import {Sequelize, DataTypes, Model, BelongsToManyAddAssociationMixin, Identifier} from 'sequelize'
import bcrypt from 'bcrypt'
import {USER_ROLE} from "../utils/enums";

const SALT_ROUNDS = 10

export interface UserModel extends Model {
  id: number
  name: String
  surname: String
  nickName: String
  email: String
  password: String
  age: number,
  role: USER_ROLE
  addExercise: BelongsToManyAddAssociationMixin<InstanceType<any>, Identifier>;
}

export async function validatePassword(dtoInPassword: string, userPassword: string): Promise<boolean> {
  return bcrypt.compare(dtoInPassword, userPassword);
}

export default (sequelize: Sequelize, modelName: string) => {
  const UserModelCtor = sequelize.define<UserModel>(
      modelName,
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING(200),
        },
        surname: {
          type: DataTypes.STRING(200),
        },
        nickName: {
          type: DataTypes.STRING(100),
          unique: true,
        },
        email: {
          type: DataTypes.STRING(200),
          unique: true,
        },
        password: {
          type: DataTypes.STRING(200),
        },
        age: {
          type: DataTypes.INTEGER,
        },
        role: {
          type: DataTypes.ENUM(...Object.values(USER_ROLE)),
          defaultValue: USER_ROLE.USER
        }
      },
      {
        paranoid: true,
        timestamps: true,
        tableName: 'users',
        hooks: {
          beforeCreate: async (user: any) => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
            }
          },
          beforeUpdate: async (user: any) => {
            if (user.changed && user.changed('password') && user.password) {
              user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
            }
          },
        }
      }
  )

  UserModelCtor.associate = (models) => {
    UserModelCtor.belongsToMany(models.Exercise, {
      through: models.ExerciseLog,
      foreignKey: "userId"
    });
  }

  return UserModelCtor
}