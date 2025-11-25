import {Router, RequestHandler} from 'express'

import isAuthenticated from "../middlewares/authMiddleware";
import isAdmin from "../middlewares/adminMiddleware";
import {createExercise, deleteExercise, editExercise, getExercise, trackExercise} from "../controllers/exerciseController";

const router = Router()

export default () => {
  router.get('/',  getExercise)

  router.post("/trackExercise", isAuthenticated, trackExercise);

  // admin routes
  router.post("/createExercise", isAuthenticated, isAdmin as RequestHandler, createExercise );

  router.post("/editExercise", isAuthenticated,isAdmin as RequestHandler, editExercise );

  router.post("/deleteExercise", isAuthenticated, isAdmin as RequestHandler, deleteExercise);

  return router
}
