

import axios from 'axios';
import * as crypto from 'crypto-js';

async function fetchData (path: string, method: string, body: string, timeout: number = 3000)  {
    const baseURL = process.env.OKX_BASE_URL!
    const secretKey = process.env.OKX_SECRET_KEY!
    const date = new Date();
    const sign = crypto.enc.Base64.stringify(crypto.HmacSHA256(date.toISOString() + method + path + body, secretKey));
    
    try {
        const response = await axios(baseURL + path, {
            method: method,
            data: body,
            headers: {
                    'OK-ACCESS-KEY': process.env.OKX_ACCESS_KEY!,
                    'OK-ACCESS-SIGN': sign,
                    'OK-ACCESS-TIMESTAMP': date.toISOString(),
                    'OK-ACCESS-PASSPHRASE': process.env.OKX_ACCESS_PASSPHRASE!,
                    'Content-Type': 'application/json',
                    'x-simulated-trading': '1',
                },
            timeout,
        });
        return response.data;
    } catch (error: any) {
        throw Error(error);
    }
}
export { fetchData };