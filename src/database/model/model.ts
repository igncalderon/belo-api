import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequalize";
export class Order extends Model {
    returnId() {
        return this.dataValues.id;
    }
}

Order.init({
    price: { type: DataTypes.NUMBER },
    volume: { type: DataTypes.NUMBER },
    pair: { type: DataTypes.STRING },
    side: { type: DataTypes.STRING },
    date_created: { type: DataTypes.NUMBER },
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
    executed: { type: DataTypes.BOOLEAN }
    }, {
    sequelize,
    timestamps: false,
    tableName: 'ordersbelo'
})
