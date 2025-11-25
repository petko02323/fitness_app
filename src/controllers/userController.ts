import {NextFunction, Request, Response} from "express";
import validateUserDtoIn from "../components/validationService";
import {responseDtoMessage} from "../components/DtoBuilder";
import {getCurrentLocale} from "../components/localeHelper";
import {models} from "../db";
import {validatePassword} from "../db/user";
import jwt from "jsonwebtoken";
import {Identifier, Model, Op} from "sequelize";
import {EXERCISE_STATE, USER_ROLE} from "../utils/enums";

const {
  User,
  Exercise,
  Program
} = models

export async function createUser (_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const {name, surname, nickName, email, password, age, role} = _req.body
  //validate input
  validateUserDtoIn(_req, res )

  let newUser;
  try {
    newUser = await User.create({
      name,
      surname,
      nickName,
      email,
      password,
      age,
      role
    })
  } catch (e) {
    throw e;
  }

  return res.json({
    data: {
      id: newUser.id,
      name: newUser.name,
      surname: newUser.surname,
      nickName: newUser.nickName,
      email: newUser.email,
      age: newUser.age,
      role: newUser.role,
    },
    message: responseDtoMessage({en: "User created successfully", sk: "Používateľ bol úspešne vytvorený"}, getCurrentLocale())
  })

}

export async function loginUser(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const {email, password} = _req.body

  let user;
  try{
    user = await User.findOne({where: {email}})
  } catch (e) {
    throw e;
  }

  if (!user || !(await validatePassword(password, user.password.toString()))) {
    return res.status(401).json({
      message: responseDtoMessage({en: "Invalid email or password", sk: "Neplatný email alebo heslo"}, getCurrentLocale())
    })
  }

  const token = jwt.sign({nickName: user.nickName, userId: user.id, userRole: user.role}, process.env.SECRET, {expiresIn: "1h"});

  res.json({data: {token}, message: responseDtoMessage({en: "Login successful", sk: "Prihlásenie úspešné"}, getCurrentLocale())});
}

export async function getProfile(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const { userId } = (_req.user as { nickName: string, userId: Identifier, userRole: string });
  const { removeExerciseLogId } = _req.body;

  const throughWhere: any = { state: EXERCISE_STATE.COMPLETED };
  if (removeExerciseLogId) {
    throughWhere.id = { [Op.ne]: removeExerciseLogId };
  }


  let userWithExercises;
  try{
    userWithExercises = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Exercise,
        include: [{ model: Program }],
        through: {
          where: throughWhere,
          attributes: ['timestamp', 'duration']
        }
      }]
    });
  } catch (e) {
    throw e;
  }

  if (!userWithExercises) {
    return res.status(404).json({
      message: responseDtoMessage({en: "User not found", sk: "Používateľ nebol nájdený"}, getCurrentLocale())
    })
  }

  res.json({data: userWithExercises, message: responseDtoMessage({en: "User profile", sk: "Profil používateľa"}, getCurrentLocale())});
}

export async function getAllUsers(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  let users;
  try{
    users = await User.findAll({attributes: { exclude: ['password'] },
    });
  } catch (e) {
    throw e;
  }
  const { userRole } = (_req.user as { nickName: string, userId: Identifier, userRole: string });

  if (userRole !== USER_ROLE.ADMIN) {
    users = users.map(user => ({
      id: user.id,
      nickName: user.nickName,
    })) as typeof users;
  }

  return res.json({
    data: users,
    message: responseDtoMessage({en: "List of users", sk: "Zoznam používateľov"}, getCurrentLocale())
  })
}

//admin functions
export async function getUserProfile(_req: Request, res: Response, _next: NextFunction): Promise<any>{
  const { userId, nickName } = _req.body;

  const user = await getUser(User, userId, nickName);

  if (!user) {
    return res.status(404).json({
      message: responseDtoMessage({en: 'User not found', sk: "Používateľ nebol nájdený"}, getCurrentLocale())
    })
  }
  res.json({
    data: {
      name: user.name,
      surname: user.surname,
      nickName: user.nickName,
      email: user.email,
      age: user.age,
      role: user.role,
    },
    message: responseDtoMessage({en: 'User profile', sk: "Profil používateľa"}, getCurrentLocale())
  });
}

export async function updateUserProfile(_req: Request, res: Response, _next: NextFunction): Promise<any>{
  const { userId, nickName, requestedChanges } = _req.body;

  const user = await getUser(User, userId, nickName);

  if (!user) {
    return res.status(404).json({
      message: responseDtoMessage({en: 'User not found', sk: "Používateľ nebol nájdený"}, getCurrentLocale())
    })
  }
  let updatedUser;
  try{
    updatedUser = await user.update(requestedChanges);
  } catch (e) {
    throw e;
  }

  res.json({
    data: {
      name: updatedUser.name,
      surname: updatedUser.surname,
      nickName: updatedUser.nickName,
      email: updatedUser.email,
      age: updatedUser.age,
      role: updatedUser.role,
    },
    message: responseDtoMessage({en: 'User profile updated successfully', sk: "Profil používateľa bol úspešne aktualizovaný"}, getCurrentLocale())
  });
}

async function getUser(userModel: typeof User, userId?: Identifier, nickName?: string): Promise<any> {
  let user;
  try{
    if(userId){
      user = await userModel.findOne({where: {id: userId}, attributes: { exclude: ['password'] }});
    }

    if(!user && nickName){
      user = await userModel.findOne({where: {nickName}, attributes: { exclude: ['password'] }});
    }
  } catch (e) {
    throw e;
  }
  return user;
}