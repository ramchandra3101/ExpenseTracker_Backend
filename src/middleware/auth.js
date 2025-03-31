import jwt from "jsonwebtoken";
import { User } from "../models/User";

const authMiddileWare = async(res, req, next) => {
    try{
        const token = req.header("Authorization")?.replace('Bearer ', '');
        if(!token){
            return res.status(401).json({message: "Authentication required"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({message: "Authentication required"});
        }

        req.user = user;
        req.token = token;
        next();


    } catch (error) {
        res.status(401).json({message: "Please Authenticate", error: error.message});
    }
};

export default authMiddileWare