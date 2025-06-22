// src/repositories/customerRepository.ts
import { getPool } from '../config/database';
import sql from 'mssql';

// Định nghĩa và export interface ngay tại đây
export interface NewCustomerData {
    full_name: string;
    email: string;
    password_hash: string;
}

class CustomerRepository {
    public async findByEmail(email: string): Promise<any | null> {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT * FROM customers WHERE email = @email');
            return result.recordset[0] || null;
        } catch (error) {
            console.error(`Error in CustomerRepository.findByEmail:`, error);
            throw error;
        }
    }

    public async create(customerData: NewCustomerData): Promise<any> {
        try {
            const { full_name, email, password_hash } = customerData;
            const pool = getPool();
            const query = `
                INSERT INTO customers (full_name, email, password_hash)
                OUTPUT INSERTED.customer_id, INSERTED.full_name, INSERTED.email, INSERTED.created_at
                VALUES (@full_name, @email, @password_hash);
            `;
            const result = await pool.request()
                .input('full_name', sql.NVarChar, full_name)
                .input('email', sql.NVarChar, email)
                .input('password_hash', sql.NVarChar, password_hash)
                .query(query);

            return result.recordset[0];
        } catch (error) {
            console.error('Error in CustomerRepository.create:', error);
            throw error;
        }
    }
}

export const customerRepository = new CustomerRepository();