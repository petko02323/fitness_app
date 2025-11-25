import {Router, RequestHandler} from 'express'
import {config} from "dotenv";

config();

import isAuthenticated from "../middlewares/authMiddleware";
import isAdmin from "../middlewares/adminMiddleware";
import {createUser, getAllUsers, getProfile, getUserProfile, loginUser, updateUserProfile} from "../controllers/userController";

const router = Router()

export default () => {
  router.post('/create', createUser)

  router.post("/login", loginUser)

  router.get("/getProfile", isAuthenticated, getProfile)

  router.get("/getAllUsers", isAuthenticated, getAllUsers);

  //admin only routes
  router.get("/admin/getUserProfile", isAuthenticated, isAdmin as RequestHandler, getUserProfile)

  router.post("/admin/updateUserProfile", isAuthenticated, isAdmin as RequestHandler, updateUserProfile )

  return router
}