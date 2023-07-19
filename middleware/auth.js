import User from "../models/user.js";
import ErrorHandler from "./error.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // Check token exist
        if (!token) return next(new ErrorHandler('Please, Login first', 404));

        // Decode token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Get user data except password
        req.user = await User.findById(decoded.uid).select('-password');

        // Use in next fn
        next();
    } catch (error) {
        next(error);
    }
}