import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequalize";

/* export class Order extends Model {}
Order.init({
    price: DataTypes.NUMBER,
    volume: DataTypes.NUMBER,
    pair: DataTypes.STRING,
    side: DataTypes.STRING,
    date_created: DataTypes.NUMBER,
    id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

}, { sequelize, modelName: 'ordersbelo' }) */

/* export const Order = sequelize.define('ordersbelo', {
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
}, {
timestamps: false,
tableName: 'ordersbelo'
}) */

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
    }, {
    sequelize,
    timestamps: false,
    tableName: 'ordersbelo'
})
