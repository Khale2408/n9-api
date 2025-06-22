// src/common/exceptions/apiError.ts
export class ApiError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Not Found') {
        super(404, message);
    }
}

// Thêm các class lỗi khác để dùng trong tương lai
export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad Request') {
        super(400, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
    }
}