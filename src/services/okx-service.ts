import { Order } from "../database/model/model";
import OkxDAO from "../integration/okx-dao";
import { OrdersSide } from "../utils/enums";

export default class OkxService {
    okxDAO: OkxDAO;
    fee: number;
    spread: number;
    expiration: number;

    constructor() {
        this.okxDAO = new OkxDAO();
        this.fee = Number(process.env.BELO_FEE!);
        this.spread = Number(process.env.BELO_SPREAD!);
        this.expiration = Number(process.env.EXPIRATION_MS!)
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
        price = price + price * this.spread;
        price = price + price * this.fee;
        return price.toFixed(4);
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
            side,
            date_created: Date.now(),
            executed: false,
        })
        
        return { volume, price, pair, orderId: order.returnId() };
    }

    async swapOrder (orderId: string) {
        const orderById = await Order.findOne({ where: { id: orderId }});
        if(!orderById) throw new Error('Order ID not found')

        const { dataValues } = orderById;
        const isExpired = Number(Date.now()) - Number(dataValues.date_created) > this.expiration;
        if(isExpired) throw new Error('Order ID expired')
        
        const { pair, volume, side, price, executed, id } = dataValues;
        if(executed) throw new Error('Order ID was already executed');
        const { code, data, sign } = await this.okxDAO.swap(dataValues);
        if(code !== '0') throw new Error(data[0].sMsg);
        await Order.update({ executed: true }, { where: { id }});
        
        return { 
            idTransaction: data[0].ordId,
            pair,
            volume,
            side,
            price,
        };
    }
}
