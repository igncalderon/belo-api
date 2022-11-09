import { Order } from "../database/model/model";
import OkxDAO from "../integration/okx-dao";
import { OrdersSide } from "../utils/enums";

export default class OkxService {
    okxDAO: OkxDAO;
    fee: string;
    spread: string;

    constructor() {
        this.okxDAO = new OkxDAO();
        this.fee = process.env.BELO_FEE!;
        this.spread = process.env.BELO_SPREAD!;
    }   
  
    calculatePrice (orders: Array<Array<string>>, volume: number) {
        let count = 0;
        let price = 0;
        for(const order of orders) {
            if(count < volume) {
                const partial = count + Number(order[1]);
                if(partial >= volume) {
                    price = price + Number(order[0]) * Number(volume - count) / volume;
                    count = volume;
                } else {
                    count = count + Number(order[1]);
                    price = price + Number(order[0]) * Number(order[1]) / volume;
                }
            }
        }        
        price = price + price * (Number(this.fee) + Number(this.spread));
        return price.toFixed(4)
    }

    async getEstimated (pair: string, volume: number, side: OrdersSide) {        
        if(side !== OrdersSide.buyer && side !== OrdersSide.seller) throw new Error('Invalid side');
        const { asks, bids, error } = await this.okxDAO.getOrders(pair);
        if(error) throw new Error(error);
        const price = this.calculatePrice(side === OrdersSide.buyer ? bids : asks, volume)
        const order = await Order.create({
            price,
            volume,
            pair: pair,
            side: side === OrdersSide.buyer ? 'buyer' : 'seller',
            date_created: Date.now()
        })
        
        return { volume, price, pair, orderId: order.returnId() };
    }

    async swapOrder (orderId: number) {
        const orderById = await Order.findOne({ where: { id: orderId }});
        if(!orderById) throw new Error('Order ID not found')

        const { dataValues } = orderById;
        const isExpired = Number(Date.now()) - Number(dataValues.date_created) > 60000 ? true : false;
        if(isExpired) throw new Error('Order ID is expired')
        
         const { pair, volume, side, price } = dataValues;
        const { code, msg, data } = await this.okxDAO.swap(dataValues)
        if(code !== '0') throw new Error(msg);

        return { 
            idTransaction: data[0].ordId,
            pair,
            volume,
            side,
            price,
        };
    }
}
