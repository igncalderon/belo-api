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

beforeEach(async () => {
    await sequelize.authenticate();
});

afterEach(async () => {
    await sequelize.close();
});


describe('tests GET /belo/api/estimated', () => {
    test('should return the estimated',  async () => {
        const mockResponse = await request(app)
            .post("/belo/api/estimated")
            .send({ pair: "BTC-USDT", vol: 10, side: "buyer" })
        expect(mockResponse.statusCode).toBe(200);
        expect(mockResponse.body.pair).toBe("BTC-USDT");
        expect(mockResponse.body.volume).toBe(10);
        expect(mockResponse.body.price).toBe("21687.7500");
        expect(mockResponse.body.side).toBe("buyer");
    });
});