import jwt from "jsonwebtoken";
import  User from "../models/User.js";
import {Op} from "sequelize";

const generateToken = (user) => {
    return jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

};

export const register = async(req, res) => {
    try{
        const{email, username, firstName, lastName, password} = req.body;
    

        if(!email || !username || !firstName || !lastName || !password){
            return res.status(400).json({message: "Please fill all the fields"});
        }
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({message: "Email or username already exists"});
        }

        const user = await User.create({
            email,
            username,
            first_name: firstName,
            last_name: lastName,
            password_hash: password,
            created_at: new Date(),
            last_pwd_change: new Date()
        });
        
        console.log(user);

        const token = generateToken(user);
        res.status(201).json({
            message: "User created successfully",
            token,

            user: {
                id: user.user_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            },
        });
    } catch (error) {
    
        res.status(500).json({message: "Server error", error: error.message});

    }
}

