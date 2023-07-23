import ErrorHandler from "../middleware/error.js";
import DetailInEx from "../models/detailinex.js";
import Transaction from "../models/transaction.js"

export const getTransactions = async (req, res, next) => {
    try {
        const totalTransactions = await Transaction.findOne({ userId: req.user._id });
        if (!totalTransactions) return next(new ErrorHandler('Please login', 404));

        const transactions = totalTransactions.details;
        let allDetails = [];
        for (let detailId of transactions) {
            const inDetail = await DetailInEx.findOne({ _id: detailId }).select('-createdAt -updatedAt -__v');
            allDetails.push(inDetail);
        }

        res.status(200).json({
            success: true,
            data: {
                message: 'successfully fetched all the Transactions',
                totalBalance: totalTransactions.totalBalance,
                totalIncome: totalTransactions.totalIncome,
                totalExpense: totalTransactions.totalExpense,
                allDetails
            }
        })
    } catch (error) {
        next(error);
    }
}

export const addTransaction = async (req, res, next) => {
    try {
        const { title, date, trans, amount, category } = req.body;

        // Create new transaction
        let details = await DetailInEx.create({
            userId: req.user._id,
            title,
            date,
            trans,
            amount,
            category
        });

        let transaction = await Transaction.findOne({ userId: details.userId });
        if (!transaction) return next(new ErrorHandler('Please login', 404));

        // Update total
        let totalBalance = transaction.totalBalance,
            totalIncome = transaction.totalIncome,
            totalExpense = transaction.totalExpense;
        if (trans === 'Income') {
            totalIncome += amount;
        } else if (trans === 'Expense') {
            totalExpense += amount;
        }
        totalBalance = totalIncome - totalExpense;
        await Transaction.updateOne(
            { userId: details.userId },
            {
                totalBalance,
                totalIncome,
                totalExpense,
                $push: { details: details._id }
            },
        );

        res.status(201).json({
            success: true,
            data: {
                message: 'Create new transaction successfully.'
            }
        })
    } catch (error) {
        next(error);
    }
}

export const editTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, date, trans, amount, category } = req.body;

        let transaction = await Transaction.findOne({ userId: req.user._id });
        let totalBalance = transaction.totalBalance,
            totalIncome = transaction.totalIncome,
            totalExpense = transaction.totalExpense;

        let detail = await DetailInEx.findById(id);
        if (!detail) return next(new ErrorHandler('Transaction not found', 404));

        // Remove old total
        if (detail.trans === 'Income') {
            totalIncome -= detail.amount
        } else if (detail.trans === 'Expense') {
            totalExpense -= detail.amount
        }
        totalBalance = totalIncome - totalExpense;
        await Transaction.updateOne(
            { userId: req.user._id },
            {
                totalBalance,
                totalIncome,
                totalExpense
            }
        )

        // Update new total
        if (trans === 'Income') {
            totalIncome += amount;
        } else if (trans === 'Expense') {
            totalExpense += amount;
        }
        totalBalance = totalIncome - totalExpense;
        await Transaction.updateOne(
            { userId: req.user._id },
            {
                totalBalance,
                totalIncome,
                totalExpense,
            },
        );

        // Update details
        await DetailInEx.updateOne(
            { _id: id },
            {
                title,
                date,
                trans,
                amount,
                category
            }
        )

        res.status(200).json({
            success: true,
            data: {
                message: 'Successfully updated',
            }
        })
    } catch (error) {
        next(error);
    }
}

export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;

        let transaction = await Transaction.findOne({ userId: req.user._id });
        let totalBalance = transaction.totalBalance,
            totalIncome = transaction.totalIncome,
            totalExpense = transaction.totalExpense;

        let detail = await DetailInEx.findById(id);
        if (!detail) return next(new ErrorHandler('Transaction not found', 404));

        // Remove old total
        if (detail.trans == 'Income') {
            totalIncome -= detail.amount
        } else if (detail.trans == 'Expense') {
            totalExpense -= detail.amount
        }
        totalBalance = totalIncome - totalExpense;
        await Transaction.updateOne(
            { userId: req.user._id },
            {
                totalBalance,
                totalIncome,
                totalExpense,
                $pull: { details: id }
            }
        )

        // Delete this transaction
        await detail.deleteOne();

        res.status(200).json({
            success: true,
            data: {
                message: 'Successfully deleted',
            }
        })
    } catch (error) {
        next(error);
    }
}

export const filterCategory = async (req, res, next) => {
    try {
        let { cate } = req.params;
        
        if (cate === 'foodndrink') cate = 'Food & Drink';
        const transactions = await DetailInEx.find({ category: cate }).select('-createdAt -updatedAt -__v');

        res.status(200).json({
            success: true,
            data: {
                message: `Filter ${cate} successfully.`,
                results: transactions
            }
        })
    } catch (error) {
        next(error);
    }
}