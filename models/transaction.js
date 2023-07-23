import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        totalBalance: {
            type: Number,
            required: true
        },
        totalIncome: {
            type: Number,
            required: true
        },
        totalExpense: {
            type: Number,
            required: true
        },
        details: {
            type: [mongoose.Types.ObjectId],
            ref: 'DetailInEx',
            required: true
        }
    },
    { timestamps: true }
)

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;