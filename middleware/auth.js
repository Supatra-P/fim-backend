import User from "../models/user.js";
import ErrorHandler from "./error.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        let decoded;
        // Check token exist
        if (req.headers.authorization) {
            decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY);
        } else if (token) {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } else {
            return next(new ErrorHandler('Please, Login first', 404));
        }
        // if (!token) return next(new ErrorHandler('Please, Login first', 404));
       
        // Decode token
        // const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Get user data except password
        req.user = await User.findById(decoded.uid).select('-password');

        // Use in next fn
        next();

        // console.log(req.headers.authorization);
        // if (!req.headers.authorization) return next(new ErrorHandler('No credentials send.', 403));

        // const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY);
        // req.user = await User.findById(decoded.uid).select('-password');

        // next();
    } catch (error) {
        next(error);
    }
}