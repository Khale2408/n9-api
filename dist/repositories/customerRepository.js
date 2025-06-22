"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepository = void 0;
// src/repositories/customerRepository.ts
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
class CustomerRepository {
    async findByEmail(email) {
        try {
            const pool = (0, database_1.getPool)();
            const result = await pool.request()
                .input('email', mssql_1.default.NVarChar, email)
                .query('SELECT * FROM customers WHERE email = @email');
            return result.recordset[0] || null;
        }
        catch (error) {
            console.error(`Error in CustomerRepository.findByEmail:`, error);
            throw error;
        }
    }
    async create(customerData) {
        try {
            const { full_name, email, password_hash } = customerData;
            const pool = (0, database_1.getPool)();
            const query = `
                INSERT INTO customers (full_name, email, password_hash)
                OUTPUT INSERTED.customer_id, INSERTED.full_name, INSERTED.email, INSERTED.created_at
                VALUES (@full_name, @email, @password_hash);
            `;
            const result = await pool.request()
                .input('full_name', mssql_1.default.NVarChar, full_name)
                .input('email', mssql_1.default.NVarChar, email)
                .input('password_hash', mssql_1.default.NVarChar, password_hash)
                .query(query);
            return result.recordset[0];
        }
        catch (error) {
            console.error('Error in CustomerRepository.create:', error);
            throw error;
        }
    }
}
exports.customerRepository = new CustomerRepository();
