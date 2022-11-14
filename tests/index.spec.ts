import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { sequelize } from '../src/database/sequalize';
import request from 'supertest';
import { app } from '../src/app';

const mock = new MockAdapter(axios);
const baseURL = process.env.OKX_BASE_URL;

mock.onGet('https://www.okx.com/api/v5/market/books?instId=BTC-USDT&sz=400').reply(200, {
    code: "0",
    msg: "",
    data: [
        {
            asks: [
                [
                    "20000.8",
                    "0.60038921",
                    "0",
                    "1"
                ]
            ],
            bids: [
                [
                    "20000.0",
                    "5",
                    "0",
                    "2"
                ],
                [
                    "20500.0",
                    "6",
                    "0",
                    "2"
                ]
            ],
            ts: "1629966436396"
        }
    ]
}
);

mock.onGet('https://www.okx.com/api/v5/market/books?instId=notfound&sz=400').reply(200, {
    code: "51001",
    msg: "Instrument ID does not exist",
    data: [],
})

mock.onPost('https://www.okx.com/api/v5/trade/order').reply(200, {
  code: "0",
  msg: "",
  data: [
    {
      clOrdId: "oktswap6",
      ordId: "312269865356374016",
      tag: "",
      sCode: "0",
      sMsg: ""
    }
  ]
});

mock.onGet("https://www.okx.com/api/v5/trade/order?ordId=312269865356374016&instId=BTC-USDT").reply(200, {
  "code": "0",
  "msg": "",
  "data": [
    {
      "instType": "FUTURES",
      "instId": "BTC-USD-200329",
      "ccy": "",
      "ordId": "312269865356374016",
      "clOrdId": "b1",
      "tag": "",
      "px": "999",
      "sz": "3",
      "pnl": "5",
      "ordType": "limit",
      "side": "buy",
      "posSide": "long",
      "tdMode": "isolated",
      "accFillSz": "0",
      "fillPx": "20300.11",
      "tradeId": "0",
      "fillSz": "0",
      "fillTime": "0",
      "state": "live",
      "avgPx": "0",
      "lever": "20",
      "tpTriggerPx": "",
      "tpTriggerPxType": "last",
      "tpOrdPx": "",
      "slTriggerPx": "",
      "slTriggerPxType": "last",
      "slOrdPx": "",
      "feeCcy": "",
      "fee": "",
      "rebateCcy": "",
      "rebate": "",
      "tgtCcy":"",
      "category": "",
      "reduceOnly": "false",
      "uTime": "1597026383085",
      "cTime": "1597026383085"
    }
  ]
}
)

beforeAll(async () => {
    await sequelize.sync({ force: false });
});

afterAll(async () => {
    sequelize.close();
});


describe('tests GET /belo/api/estimated', () => {
    test('should return the estimated',  async () => {
        const mockResponse = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "BTC-USDT", vol: 10, side: "buyer" })
        expect(mockResponse.statusCode).toBe(200);
        expect(mockResponse.body.pair).toBe("BTC-USDT");
        expect(mockResponse.body.volume).toBe(10);
        expect(mockResponse.body.priceEstimated).toBe("21687.75");
    });
    test('should return error if volume is not a positive number', async () => {
        const mockResponse = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "BTC-USDT", vol: 0, side: "buyer" })
        expect(mockResponse.statusCode).toBe(500);
        expect(mockResponse.body).toEqual({
            error: true,
            message: "Volume must be greater than 0",
        });
    })
    test('should return invalid instrument ID',  async () => {
        const mockResponse = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "notfound", vol: 10, side: "buyer" })
        expect(mockResponse.statusCode).toBe(500);
        expect(mockResponse.body).toEqual({
            error: true,
            message: "Instrument ID does not exist",
        });
    });

    test('should return invalid volume', async () => {
        const mockResponse = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "BTC-USDT", vol: 'error', side: "buyer" })
        expect(mockResponse.statusCode).toBe(500);
        expect(mockResponse.body).toStrictEqual({
            error: true,
            message: "invalid input syntax for type numeric: \"error\""
        });
    });
});

describe('tests POST /belo/api/swap/:orderId', () => {
    test('should do the estimated and confirm the swap only the first time', async () => {
        const mockEstimated = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "BTC-USDT", vol: 10, side: "buyer" })
        const mockSwap = await request(app)
            .post(`/belo/api/swap/${mockEstimated.body.orderId}`)
            .send()
        expect(mockSwap.statusCode).toBe(200)
        expect(mockSwap.body).toStrictEqual({
            idTransaction: "312269865356374016", 
            pair: "BTC-USDT",
            price: "21741.42",
            side: "buyer",
            volume: "10",
        })
        const mockSwap2 = await request(app)
            .post(`/belo/api/swap/${mockEstimated.body.orderId}`)
            .send()
        expect(mockSwap2.statusCode).toBe(500)
        expect(mockSwap2.body).toStrictEqual({
            error: true,
            message: "Order ID was already executed"
        });
    });

    test('should return order id is expired', async () => {
        const mockResponse = await request(app)
            .post('/belo/api/swap/1')
            .send()
        expect(mockResponse.statusCode).toBe(500)
        expect(mockResponse.body).toStrictEqual({error: true, message: "Order ID expired"})
    })
    test('should return order id not found', async () => {
        const mockResponse = await request(app)
            .post('/belo/api/swap/1000')
            .send()
        expect(mockResponse.statusCode).toBe(500)
        expect(mockResponse.body).toStrictEqual({error: true, message: "Order ID not found"})
    })
});