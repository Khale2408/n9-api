import { getPool } from '../config/database';
import sql from 'mssql';

export const getCustomers = async () => {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM customers WHERE deleted_at IS NULL');
    return result.recordset;
};

export const getCustomerDetail = async (id: number) => {
    const pool = getPool();
    const result = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM customers WHERE customer_id = @id');
    return result.recordset[0];
};

export const updateCustomer = async (id: number, data: any) => {
    const pool = getPool();
    await pool.request()
        .input('id', sql.Int, id)
        .input('full_name', sql.NVarChar, data.full_name)
        .input('phone', sql.NVarChar, data.phone)
        .query('UPDATE customers SET full_name = @full_name, phone = @phone WHERE customer_id = @id');
    return getCustomerDetail(id);
};

export const deleteCustomer = async (id: number) => {
    const pool = getPool();
    await pool.request().input('id', sql.Int, id)
        .query('UPDATE customers SET deleted_at = GETDATE() WHERE customer_id = @id');
};