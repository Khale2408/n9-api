"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
const apiError_1 = require("../common/exceptions/apiError");
const register = async (userData) => {
    const pool = (0, database_1.getPool)();
    try {
        // Check if email already exists
        const checkEmailQuery = `
            SELECT customer_id FROM customers WHERE email = @email AND deleted_at IS NULL
        `;
        const checkResult = await pool.request()
            .input('email', mssql_1.default.NVarChar, userData.email.toLowerCase())
            .query(checkEmailQuery);
        if (checkResult.recordset.length > 0) {
            throw new apiError_1.ConflictError('Email đã được sử dụng');
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
        // Insert user into database
        const insertQuery = `
            INSERT INTO customers (
                full_name, email, password_hash, phone, 
                email_verified, is_active, created_at, updated_at
            )
            OUTPUT INSERTED.customer_id, INSERTED.full_name, INSERTED.email, 
                   INSERTED.phone, INSERTED.created_at
            VALUES (
                @full_name, @email, @password_hash, @phone, 
                0, 1, GETDATE(), GETDATE()
            )
        `;
        const result = await pool.request()
            .input('full_name', mssql_1.default.NVarChar, userData.full_name.trim())
            .input('email', mssql_1.default.NVarChar, userData.email.toLowerCase())
            .input('password_hash', mssql_1.default.NVarChar, hashedPassword)
            .input('phone', mssql_1.default.NVarChar, userData.phone || null)
            .query(insertQuery);
        const newUser = result.recordset[0];
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            customer_id: newUser.customer_id,
            email: newUser.email,
            type: 'customer'
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return {
            user: {
                customer_id: newUser.customer_id,
                full_name: newUser.full_name,
                email: newUser.email,
                phone: newUser.phone,
                created_at: newUser.created_at
            },
            token
        };
    }
    catch (error) {
        if (error instanceof apiError_1.ConflictError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Đăng ký thất bại: ${error.message}`);
    }
};
exports.register = register;
const login = async (loginData) => {
    const pool = (0, database_1.getPool)();
    try {
        // Find user by email
        const query = `
            SELECT 
                customer_id, full_name, email, phone, password_hash, 
                created_at, is_active, email_verified
            FROM customers 
            WHERE email = @email AND deleted_at IS NULL
        `;
        const result = await pool.request()
            .input('email', mssql_1.default.NVarChar, loginData.email.toLowerCase())
            .query(query);
        if (result.recordset.length === 0) {
            throw new apiError_1.UnauthorizedError('Email hoặc mật khẩu không đúng');
        }
        const user = result.recordset[0];
        // Check if account is active
        if (!user.is_active) {
            throw new apiError_1.UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(loginData.password, user.password_hash);
        if (!isPasswordValid) {
            throw new apiError_1.UnauthorizedError('Email hoặc mật khẩu không đúng');
        }
        // Update last login
        await pool.request()
            .input('customer_id', mssql_1.default.Int, user.customer_id)
            .query(`
                UPDATE customers 
                SET last_login = GETDATE(), 
                    login_count = ISNULL(login_count, 0) + 1,
                    updated_at = GETDATE()
                WHERE customer_id = @customer_id
            `);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            customer_id: user.customer_id,
            email: user.email,
            type: 'customer'
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return {
            user: {
                customer_id: user.customer_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at
            },
            token
        };
    }
    catch (error) {
        if (error instanceof apiError_1.UnauthorizedError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Đăng nhập thất bại: ${error.message}`);
    }
};
exports.login = login;
const getProfile = async (customer_id) => {
    const pool = (0, database_1.getPool)();
    try {
        const query = `
            SELECT 
                customer_id, full_name, email, phone, created_at,
                email_verified, last_login, total_orders, total_spent,
                loyalty_points, customer_tier
            FROM customers 
            WHERE customer_id = @customer_id AND is_active = 1 AND deleted_at IS NULL
        `;
        const result = await pool.request()
            .input('customer_id', mssql_1.default.Int, customer_id)
            .query(query);
        if (result.recordset.length === 0) {
            throw new apiError_1.UnauthorizedError('Không tìm thấy thông tin người dùng');
        }
        return result.recordset[0];
    }
    catch (error) {
        if (error instanceof apiError_1.UnauthorizedError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Lấy thông tin thất bại: ${error.message}`);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (customer_id, updateData) => {
    const pool = (0, database_1.getPool)();
    try {
        let updateFields = [];
        const request = pool.request().input('customer_id', mssql_1.default.Int, customer_id);
        if (updateData.full_name) {
            updateFields.push('full_name = @full_name');
            request.input('full_name', mssql_1.default.NVarChar, updateData.full_name.trim());
        }
        if (updateData.phone) {
            updateFields.push('phone = @phone');
            request.input('phone', mssql_1.default.NVarChar, updateData.phone);
        }
        if (updateFields.length === 0) {
            throw new apiError_1.BadRequestError('Không có dữ liệu để cập nhật');
        }
        updateFields.push('updated_at = GETDATE()');
        const updateQuery = `
            UPDATE customers 
            SET ${updateFields.join(', ')}
            WHERE customer_id = @customer_id AND is_active = 1 AND deleted_at IS NULL
        `;
        await request.query(updateQuery);
        // Return updated profile
        return await (0, exports.getProfile)(customer_id);
    }
    catch (error) {
        if (error instanceof apiError_1.BadRequestError) {
            throw error;
        }
        throw new apiError_1.BadRequestError(`Cập nhật thông tin thất bại: ${error.message}`);
    }
};
exports.updateProfile = updateProfile;
