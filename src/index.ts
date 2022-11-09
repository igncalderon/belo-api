import express from "express";
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import beloRouter from './api/index';
import "reflect-metadata";
import { sequelize } from "./database/sequalize";


dotenv.config();
const app = express();
const port = 3000;


sequelize.sync({ force: false }).then(() => {
  console.log('DataBase connected successfully');
}).catch(err => console.log('Error connecting Database', err));

app.use('/belo/api', beloRouter)

function handleError(err: any, _req: Request, res: Response, _next: any) {
    res.status(err.statusCode || 500).send({ error: true, message: err.message });
}

app.use('*', (req: Request, res: Response) => {
    res.status(500).send({ error: true, message: 'Url is not valid' });
});

app.use(handleError);

app.listen(port,() => {
  console.log(`Example app listening on port ${port}`);
});
