import * as z from "zod";

export const UserSchema = z.object({
  name: z.string().max(200),
  surname: z.string().max(200),
  nickName: z.string().max(100),
  email: z.email().max(200),
  password: z.string().min(6).max(200),
  age: z.number().int().min(0).optional(),
  role: z.enum(["USER", "ADMIN"])
});

export const ExerciseSchema = z.object({
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  name: z.string().max(200),
  programId: z.number()
});