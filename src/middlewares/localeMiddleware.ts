import {NextFunction, Request, Response} from "express";
import { requestContext } from "../context";

const DEFAULT_LOCALE = "en";

export default function setLocale(req: Request, res: Response, next: NextFunction) {
  requestContext.run({ locale: (req.headers["locale"] ?? DEFAULT_LOCALE) as string }, () => {
    next();
  });
}