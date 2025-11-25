import {UserSchema, ExerciseSchema} from "../validations";
import {NextFunction, Request, Response} from "express";
import {UserModel} from "../db/user";


export default function validateUserDtoIn(req: Request, res: Response){
  const {name, surname, nickName, email, password, age, role} = req.body;

  const parseResult = UserSchema.safeParse({name, surname, nickName, email, password, age, role});
  if (!parseResult.success) {
    return invalidDtoInResponse(res, parseResult);
  }
}

export function validateExerciseDtoIn(req: Request, res: Response){
  const {difficulty, name, programId} = req.body;

  const parseResult = ExerciseSchema.safeParse({difficulty, name, programId});
  if (!parseResult.success) {
    return invalidDtoInResponse(res, parseResult);
  }
}

function invalidDtoInResponse(res: Response, parseResult: any) {
  return res.status(400).json({
    message: 'Invalid input',
    errors: parseResult?.error?.issues
  })
}