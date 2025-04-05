import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {Op} from "@sequelize/core";




const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN;

//Generate token for giving session time. User no need to login again until the token expires
const generateToken = (userId) => {
    return jwt.sign({id: userId}, JWT_SECRET,{
        expiresIn: JWT_EXPIRATION
    })
}

export const SignUp = async(req, res) => {
    try{
        const { username, first_name, last_name, email, password } = req.body;
        if(!username || !first_name || !last_name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }

        });

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Create new user
        const newuser = await User.create({
            username,
            first_name,
            last_name,
            email,
            password_hash: password,
        })

        const token = generateToken(newuser.user_id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                user_id: newuser.user_id,
                username: newuser.username,
                first_name: newuser.first_name,
                last_name: newuser.last_name,
                email: newuser.email,
                
            }
        });


    } catch(err){
        console.error('SignUp error:', err);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
}

export const SignIn = async(req, res) => {
    try{
        const {identifier, password} = req.body;
        if(!identifier || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // find user by username or email

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Username or email not exists"
            });
        }

        // Validate password

        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        //Update last login time

        user.last_logged = new Date();
        await user.save();


        // Generate token
        const token = generateToken(user.user_id);

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user : {
                user_id: user.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            }
        });
    } catch(err){
        console.error('SignIn error:', err);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
}






