import {NextFunction, Request, Response} from "express";
import {models} from "../db";
import {Identifier, Op} from "sequelize";
import {responseDtoMessage} from "../components/DtoBuilder";
import {getCurrentLocale} from "../components/localeHelper";
import {validateExerciseDtoIn} from "../components/validationService";

const DEFAULT_PAGE_SIZE = 10;

const {
  User,
  Exercise,
  Program
} = models

export async function getExercise(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  let {page, limit, programID, search} = _req.query as {page?: string , limit?: string, programID?: string, search?: string};
  const pageNumber = Number(page) ?? 1;
  const pageSize = Number(limit) ?? DEFAULT_PAGE_SIZE;

  const where: any = {};
  if (programID) where.programID = programID;
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  let exercises;
  try{
    exercises = await Exercise.findAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      include: [{
        model: Program
      }],
      ...(Object.keys(where).length ? { where } : {})
    })
  } catch (e) {
    throw e;
  }

  return res.json({
    data: exercises,
    message: 'List of exercises'
  })
}

export async function trackExercise(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const {exerciseId, state, duration} = _req.body

  const { userId } = (_req.user as { nickName: string, userId: Identifier, userRole: string });

  let exercise, user;
  try{
    exercise = await Exercise.findByPk(exerciseId);
    user = await User.findByPk(userId);
  } catch (e) {
    throw e;
  }

  if (!user) {
    return res.status(404).json({ message: responseDtoMessage({en: "User not found", sk: "Používateľ nebol nájdený"}, getCurrentLocale()) });
  }

  if (!exercise) {
    return res.status(404).json({
      message: responseDtoMessage({en: "Exercise not found", sk: "Cvičenie nebolo nájdené"}, getCurrentLocale())
    })
  }

  let response;
  try{
    response = await user.addExercise(exercise, {
      through: {
        state,
        duration,
        userId
      }
    });
  } catch (e) {
    throw e;
  }
  res.json({response});

}

//admin functions
export async function createExercise(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const {difficulty, name, description, programId} = _req.body;

  validateExerciseDtoIn(_req, res );

  let program;
  try{
    program = await Program.findByPk(programId);
  } catch (e) {
    throw e;
  }

  if (!program) {
    return res.status(404).json({
      message: 'Program not found'
    })
  }

  const response = await Exercise.create({
    difficulty,
    name,
    description,
    programID: programId
  });
  res.json({newExercise: response});
}

export async function editExercise(_req: Request, res: Response, _next: NextFunction): Promise<any> {
  const {id, difficulty, name, programId} = _req.body;
  validateExerciseDtoIn(_req, res );

  let exercise;
  try{
    exercise = await Exercise.findByPk(id);
  } catch (e) {
    throw e;
  }

  if (!exercise) {
    return res.status(404).json({
      message: responseDtoMessage({ en: 'Exercise not found', sk: "Cvičenie nebolo nájdené" }, getCurrentLocale())
    })
  }

  let program;
  if (programId) {
    try{
      program = await Program.findByPk(programId);
    } catch (e) {
      throw e;
    }

    if (!program) {
      return res.status(404).json({
        message: responseDtoMessage({ en: 'Program not found', sk: "Program nebol nájdený" }, getCurrentLocale())
      })
    }
  }

  await exercise.update({
    difficulty: difficulty || exercise.difficulty,
    name: name || exercise.name,
    programID: programId,
  });

  res.json({updatedExercise: exercise});
}

export async function deleteExercise (_req: Request, res: Response, _next: NextFunction): Promise<any>{
  const {id} = _req.body;

  let exercise;
  try{
    exercise = await Exercise.findByPk(id);
  } catch (e) {
    throw e;
  }

  if (!exercise) {
    return res.status(404).json({
      message: responseDtoMessage({ en: 'Exercise not found', sk: "Cvičenie nebolo nájdené" }, getCurrentLocale())
    })
  }

  try{
    await exercise.destroy();
  } catch (e) {
    throw e;
  }

  res.json({message: responseDtoMessage({ en: 'Exercise deleted successfully', sk: "Cvičenie bolo úspešne zmazané" }, getCurrentLocale())});
}