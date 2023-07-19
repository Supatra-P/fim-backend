import express from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

export const app = express();

// Configuration
config({
    path: "./data/config.env"
});

// Middleware
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
});
