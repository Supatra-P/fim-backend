import express from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.js';
import transactionRouter from './routes/transaction.js';
import { errorMiddleware } from './middleware/error.js';

export const app = express();

// Configuration
config({
    path: "./data/config.env"
});

// Middleware
app.use(morgan('dev')); // log request
app.use(express.json()); // parse json payload application/json
app.use(express.urlencoded({extended: true})); // encode payload from post url application/x-www-form-urlencoded
app.use(helmet()); // protect api like XXS
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser()); // make cookies readable or useable
app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        // origin: 'http://localhost:3000',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
); // cross-origin resource sharing

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/transactions', transactionRouter);

app.get('/', (req, res) => {
    res.send('Welcome to Fim api!');
});

app.get('/api/v1/', (req, res) => {
    res.status(200).json({ success: true, message: 'Hi test test!' })
})

// Error Handing
app.use(errorMiddleware);
