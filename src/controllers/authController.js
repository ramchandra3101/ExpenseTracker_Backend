import dotenv from "dotenv";
dotenv.config();

import User from "../models/User";
import jwt from "jsonwebtoken";
import {Op} from "@sequelize/core";



const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN;






