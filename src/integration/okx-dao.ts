import { fetchData } from '../utils/fetchData';

interface SwapData {
    pair: string,
    price: number,
    side: string,
    volume: number,
}

export default class OkxDAO {
    async getOrders(pair: string) {
        const url = `/api/v5/market/books?instId=${pair}&sz=400`;
        const { data, msg } = await fetchData(url, 'GET', '');
        return data.length ? data[0] : { error: msg } ;
    }

    async swap(data: SwapData) {
        const { pair, volume, side } = data;
        const url = '/api/v5/trade/order';
        const response = await fetchData(url, 'POST', JSON.stringify({
                instId: pair,
                tdMode: 'cash',
                side: side === 'buyer' ? 'buy' : 'sell',
                ordType: 'market',
                sz: volume,
                tgtCcy: side === 'buyer' ? 'quote_ccy' : 'base_ccy',
        }));
        return response;
    }
    async detailSwap(ordId: string, instId: string) {
        const url = `/api/v5/trade/order?ordId=${ordId}&instId=${instId}`;
        const response = await fetchData(url, 'GET', null);
        return response;
    }
}