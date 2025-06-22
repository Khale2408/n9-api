import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import sql from 'mssql';
import { BadRequestError, UnauthorizedError, ConflictError } from '../common/exceptions/apiError';

export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    customer_id: number;
    full_name: string;
    email: string;
    phone?: string;
    created_at: Date;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const pool = getPool();
    try {
        // Check if email already exists
        const checkEmailQuery = `
            SELECT customer_id FROM customers WHERE email = @email AND deleted_at IS NULL
        `;
        const checkResult = await pool.request()
            .input('email', sql.NVarChar, userData.email.toLowerCase())
            .query(checkEmailQuery);

        if (checkResult.recordset.length > 0) {
            throw new ConflictError('Email đã được sử dụng');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

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
            .input('full_name', sql.NVarChar, userData.full_name.trim())
            .input('email', sql.NVarChar, userData.email.toLowerCase())
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('phone', sql.NVarChar, userData.phone || null)
            .query(insertQuery);

        const newUser = result.recordset[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                customer_id: newUser.customer_id, 
                email: newUser.email,
                type: 'customer'
            },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

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

    } catch (error: any) {
        if (error instanceof ConflictError) {
            throw error;
        }
        throw new BadRequestError(`Đăng ký thất bại: ${error.message}`);
    }
};

export const login = async (loginData: LoginData): Promise<AuthResponse> => {
    const pool = getPool();
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
            .input('email', sql.NVarChar, loginData.email.toLowerCase())
            .query(query);

        if (result.recordset.length === 0) {
            throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
        }

        const user = result.recordset[0];

        // Check if account is active
        if (!user.is_active) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
        }

        // Update last login
        await pool.request()
            .input('customer_id', sql.Int, user.customer_id)
            .query(`
                UPDATE customers 
                SET last_login = GETDATE(), 
                    login_count = ISNULL(login_count, 0) + 1,
                    updated_at = GETDATE()
                WHERE customer_id = @customer_id
            `);

        // Generate JWT token
        const token = jwt.sign(
            { 
                customer_id: user.customer_id, 
                email: user.email,
                type: 'customer'
            },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

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

    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw new BadRequestError(`Đăng nhập thất bại: ${error.message}`);
    }
};

export const getProfile = async (customer_id: number): Promise<User> => {
    const pool = getPool();
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
            .input('customer_id', sql.Int, customer_id)
            .query(query);

        if (result.recordset.length === 0) {
            throw new UnauthorizedError('Không tìm thấy thông tin người dùng');
        }

        return result.recordset[0];

    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw new BadRequestError(`Lấy thông tin thất bại: ${error.message}`);
    }
};

export const updateProfile = async (customer_id: number, updateData: Partial<RegisterData>): Promise<User> => {
    const pool = getPool();
    try {
        let updateFields: string[] = [];
        const request = pool.request().input('customer_id', sql.Int, customer_id);

        if (updateData.full_name) {
            updateFields.push('full_name = @full_name');
            request.input('full_name', sql.NVarChar, updateData.full_name.trim());
        }

        if (updateData.phone) {
            updateFields.push('phone = @phone');
            request.input('phone', sql.NVarChar, updateData.phone);
        }

        if (updateFields.length === 0) {
            throw new BadRequestError('Không có dữ liệu để cập nhật');
        }

        updateFields.push('updated_at = GETDATE()');

        const updateQuery = `
            UPDATE customers 
            SET ${updateFields.join(', ')}
            WHERE customer_id = @customer_id AND is_active = 1 AND deleted_at IS NULL
        `;

        await request.query(updateQuery);

        // Return updated profile
        return await getProfile(customer_id);

    } catch (error: any) {
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new BadRequestError(`Cập nhật thông tin thất bại: ${error.message}`);
    }
};