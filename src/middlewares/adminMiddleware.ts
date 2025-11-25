import {NextFunction, Request, Response} from "express";
import {Identifier} from "sequelize";
import {USER_ROLE} from "../utils/enums";

export default function isAdmin(req: Request, res: Response, next: NextFunction) {
  const { userRole } = (req.user as { nickName: string, userId: Identifier, userRole: string })
  if (userRole === USER_ROLE.ADMIN) {
    return next();
  } else {
    return res.status(403).json({message: 'Forbidden: Admins only'});
  }
}