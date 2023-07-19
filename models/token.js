import mongoose from "mongoose";

const TokenSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 10800
        }
    }
);

const Token = mongoose.model("Token", TokenSchema);
export default Token;