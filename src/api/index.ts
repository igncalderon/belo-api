import express from "express";
import { Request, Response, NextFunction } from 'express';
import OkxService from '../services/okx-service';

const router = express();

router.post('/estimated', async (req: Request, res: Response, next: NextFunction) => {
  try {   
    const { pair, vol, side } = req.body;
    const service = new OkxService();
    const response = await service.getEstimated(pair, vol, side);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/swap/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const service = new OkxService();
    const response = await service.swapOrder(orderId)
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;