export class AppError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
export function errorHandler(error, req, res, next) {
    console.error('Error:', error);
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.message,
            errors: error.errors,
            timestamp: new Date(),
            path: req.path,
        });
        return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({
            error: 'Invalid JSON in request body',
            timestamp: new Date(),
            path: req.path,
        });
        return;
    }
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date(),
        path: req.path,
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date(),
    });
}
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map