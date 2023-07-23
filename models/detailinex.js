import mongoose from "mongoose";

const DetailInExSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        date: {
            type: Date,
            default: Date.now(),
        },
        trans: {
            type: String,
            enum: ['Income', 'Expense'],
            default: 'Income',
        },
        amount: {
            type: Number,
            min: [1],
            required: true,
        },
        category: {
            type: String,
            enum: ['Food & Drink', 'Transportation', 'Bill', 'Entertainments', 'Other'],
            default: 'Food & Drink',
        }
    },
    { timestamps: true }
)

const DetailInEx = mongoose.model('DetailInEx', DetailInExSchema);
export default DetailInEx;