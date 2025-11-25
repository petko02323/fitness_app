import {Router, RequestHandler} from 'express'

import isAuthenticated from "../middlewares/authMiddleware";
import isAdmin from "../middlewares/adminMiddleware";
import {createExercise, deleteExercise, editExercise, getExercise, trackExercise} from "../controllers/exerciseController";

const router = Router()

export default () => {
  router.get('/',  getExercise)

  router.post("/trackExercise", isAuthenticated, trackExercise);

  // admin routes
  router.post("/admin/createExercise", isAuthenticated, isAdmin as RequestHandler, createExercise );

  router.post("/admin/editExercise", isAuthenticated,isAdmin as RequestHandler, editExercise );

  router.post("/admin/deleteExercise", isAuthenticated, isAdmin as RequestHandler, deleteExercise);

  return router
}
