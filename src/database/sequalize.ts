import { Sequelize } from "sequelize";

export const sequelize = new Sequelize('db_belo', 'postgres', 'test', {
  host: 'localhost',
  dialect: "postgres",
  port: 5432,
});

