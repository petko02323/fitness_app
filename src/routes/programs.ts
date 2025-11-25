import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import {responseDtoMessage} from "../components/DtoBuilder";
import {getCurrentLocale} from "../components/localeHelper";

const router = Router()

const {
	Program
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: responseDtoMessage({en: "List of programs", sk: "Zoznam programov"}, getCurrentLocale())
		})
	})

	return router
}
