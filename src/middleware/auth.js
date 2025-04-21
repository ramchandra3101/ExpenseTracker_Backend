import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Auth.js provides authentication, use to protect routes further. if user is not logged in, they will not be able to access the routes
// If we dont have this, Anyone can access protected APIs , even without logging in.

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const authenticate = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Acess Denied. No token provided"
            });
        }
        // Extract token from the header
        // Bearer <token>
        const token = authHeader.split(' ')[1];
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Acess Denied. Invalid token format"
            });
        }
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user_id = decoded.id;
        req.user = {user_id: decoded.id};
        next();


    }catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}

export default authenticate;