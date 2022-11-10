import express, { NextFunction } from "express";
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';

import "reflect-metadata";
import * as bodyParser from 'body-parser';
import { sequelize } from "./database/sequalize";
import router from "./api";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize.sync({ force: false }).then(() => {
  console.log('DataBase connected successfully');
}).catch(err => console.log('Error connecting Database', err));

app.use('/belo/api', router);

function handleError(err: any, _req: Request, res: Response, _next: NextFunction) {
    res.status(err.statusCode || 500).send({ error: true, message: err.message });
}

app.use('*', (req: Request, res: Response) => {
    res.status(500).send({ error: true, message: 'Url is not valid' });
});

app.use(handleError);

export { app };