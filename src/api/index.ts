import express from "express";
import { Request, Response, NextFunction } from 'express';
import OkxService from '../services/okx-service';
import { OrdersSide } from "../utils/enums";


const app = express();

interface ReqQuery {
  pair: string,
  vol: number,
  side: OrdersSide,
  orderId: string
}

interface  ReqParams {
  orderId: number,
}

app.get('/estimated', async (req: Request<{}, {}, {}, ReqQuery>, res: Response, next: NextFunction) => {
  try {
    const { pair, vol, side } = req.query;
    const service = new OkxService();
    const response = await service.getEstimated(pair, vol, side);
    res.status(200).json(response)
  } catch (err) {
    next(err);
  }
});

app.post('/swap/:orderId', async (req: Request<ReqParams, {}, {}, {}>, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const service = new OkxService();
    const response = await service.swapOrder(orderId)
    res.status(200).json(response)
  } catch (err) {
    next(err);
  }
});

export default app;