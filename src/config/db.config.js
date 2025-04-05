import dotenv from "dotenv";
dotenv.config();
import {Sequelize}  from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";



console.log("DB Config:", {
    DB_NAME: process.env.DB_NAME ,
    DB_USER: process.env.DB_USER ,
    DB_PASSWORD: process.env.DB_PASSWORD ,
    DB_HOST: process.env.DB_HOST
});


export const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
    logging: console.log,
    schema: process.env.DB_SCHEMA,
});

export const connectDB = async () => {
    try{
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        return false;
    }
};



    


