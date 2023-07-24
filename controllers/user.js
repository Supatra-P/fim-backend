import User from '../models/user.js';
import Token from '../models/token.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendCookie, sendEmail } from '../utils/features.js';
import ErrorHandler from '../middleware/error.js';
import Transaction from '../models/transaction.js';

export const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Check user exist
        let user = await User.findOne({ $or: [{ name: username }, { email }] });
        if (user) return next(new ErrorHandler('Username or email already exist.', 400));

        // Check length password
        if (password.length < 8) return next(new ErrorHandler('Weak password, At least 8 characters.', 400));

        // Encrypt password before store to database
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = await User.create({
            name: username,
            email,
            password: hashedPassword,
            role,
        });

        // Set cookies
        sendCookie(user, res, 201, 'Register successfully.');

        // Create initial transaction
        await Transaction.create({
            userId: user._id,
            totalBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            details: []
        })
    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check user exist
        let user = await User.findOne({ email });
        if (!user) return next(new ErrorHandler('Register first.', 400));

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return next(new ErrorHandler('Incorrect password.', 401));

        // Set cookies
        sendCookie(user, res, 200, 'Login successfully.');

        // Create initial transaction
        const transaction = await Transaction.findOne({ userId: user._id });
        if (!transaction) {
            await Transaction.create({
                userId: user._id,
                totalBalance: 0,
                totalIncome: 0,
                totalExpense: 0,
                details: []
            })
        }
    } catch (error) {
        next(error);
    }
}

export const logout = (req, res) => {
    // Clear token
    res.status(200)
        .cookie("token", null, {
            httpOnly: true,
            expires: new Date(Date.now()),
            sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "Development" ? false : true,
        })
        .json({
            success: true,
            message: 'Logout successfully.'
        });
}

export const getMyProfile = (req, res) => {
    // Send data if user has authenticated
    // console.log(req.cookies)
    res.status(200).cookie("token", req.cookies, {
        httpOnly: true,
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }).send({
        success: true,
        message: `Welcome ${req.user.name}!`
    });
}

export const requestResetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check user exist
        const user = await User.findOne({ email }).select('-password');
        if (!user) return next(new ErrorHandler('Email address not found', 400));

        // Make sure token not exist
        let token = await Token.findOne({ userId: user._id });
        if (token) await token.deleteOne();

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Encrypt resetToken before store to db
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hashedResetToken = await bcrypt.hash(resetToken, salt);

        // Store to db
        await Token.create({
            userId: user._id,
            token: hashedResetToken,
            createdAt: Date.now()
        });

        // Create URL
        const link = `${process.env.CLIENT_URL}/users/reset-password?token=${resetToken}&userId=${user._id}`;

        // Send email
        sendEmail(email, 'Please reset your Fim password', { name: user.name, link: link }, next);

        res.status(200).json({
            success: true,
            message: "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder."
        });
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { token, userId } = req.query;
        const { password } = req.body;

        // Check user
        const user = await Token.findOne({ userId });
        if (!user) return next(new ErrorHandler('Your link has expired.', 400));

        // Check token
        const isMatch = await bcrypt.compare(token, user.token);
        if (!isMatch) return next(new ErrorHandler('Invalid or Expired link.', 400));

        // Check length password 
        if (password.length < 8) return next(new ErrorHandler('Weak password, At least 8 characters.', 400));

        // Encrypt password
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hashedResetPassword = await bcrypt.hash(password, salt);

        // Change password
        await User.updateOne(
            { _id: user.userId },
            { $set: { password: hashedResetPassword } }
        );

        // Clear user's Token
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Changed password successfully.'
        });
    } catch (error) {
        next(error);
    }
}