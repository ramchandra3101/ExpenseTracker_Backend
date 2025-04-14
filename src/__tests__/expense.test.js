import { sequelize } from "../config/db.config.js";
import User from "../models/User.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import jwt from "jsonwebtoken";     
import dotenv from "dotenv";

dotenv.config();

let authenticatedUser;
let authtoken;
let testPaymentMethod;
let testCategory;

describe("Expense tests:", () => {
    beforeAll(async () => {
        await sequelize.sync({force: true});
        const userData = {
            username: ""

        }

    })
})



