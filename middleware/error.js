// Inheritant
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        // If error message did not be sent, use parent class (Error)'s one.
        super(message);
        // Set status
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}

export default ErrorHandler;