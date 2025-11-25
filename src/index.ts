import http from 'http'
import express from 'express'
import {config} from "dotenv";

config();

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import UserRouter from './routes/users'

const app = express()
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import passport from "./passport/passport"
import setLocale from "./middlewares/localeMiddleware";
import errorMiddleware from "./middlewares/errorMiddleware";
import {readFileSync} from "fs";
import path from "node:path";

// Swagger setup
const file = readFileSync(path.join(__dirname, "openapi.yaml"), "utf8");
const swaggerDocument = parse(file);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(setLocale)
app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())
app.use('/users', UserRouter())
app.use(errorMiddleware)


const httpServer = http.createServer(app)

try {
    sequelize.sync()
} catch (error) {
    console.log('Sequelize sync error')
}

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer
