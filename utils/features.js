import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ErrorHandler from '../middleware/error.js';

export const sendCookie = (user, res, statusCode = 200, message) => {
    // Generate token
    const token = jwt.sign({ uid: user._id }, process.env.SECRET_KEY);

    // Send token
    res
        .status(statusCode)
        .cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + process.env.EXP_TOKEN * 1000),
            sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "Development" ? false : true,
        })
        .json({ success: true, message });
}

export const sendEmail = async (email, subject, payload, next) => {
    try {
        // Config SMTP transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const link = `http://${payload.link}`;

        // Create email content
        const options = () => {
            return {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: subject,
                html: `<h3>Hi, ${payload.name}</h3>
            <p>
                We heard that you lost your Fim password. Sorry about that!
                But don't worry! You can click the following link below to reset your password:
            </p>
            <br>
            <a href='${payload.link}'>Reset your password</a>
            <br>
            <p>If you don’t use this link within 3 hours, it will expire.</p>
            <br><br>
            <p>Thanks,<br>The Fim</p>
            <small>You're receiving this email because a password reset was requested for your account.</small>`,
            };
        };

        // Send email
        transporter.sendMail(options(), (err, info) => {
            if (err) return next(new ErrorHandler(err.message, 500));
            else return res.status(200).json({ success: true, message: 'Send email successfully' })
        });
    } catch (error) {
        next(error);
    }
}