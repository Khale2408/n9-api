import { getPool } from '../config/database';
import sql from 'mssql';

export const getProducts = async () => {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM products WHERE deleted_at IS NULL');
    return result.recordset;
};

export const getProductDetail = async (id: number) => {
    const pool = getPool();
    const result = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM products WHERE product_id = @id');
    return result.recordset[0];
};

export const createProduct = async (data: any) => {
    const pool = getPool();
    const result = await pool.request()
        .input('name', sql.NVarChar, data.name)
        .input('description', sql.NVarChar, data.description)
        .input('price', sql.Decimal, data.price)
        .query('INSERT INTO products (name, description, price, created_at, updated_at) OUTPUT INSERTED.* VALUES (@name, @description, @price, GETDATE(), GETDATE())');
    return result.recordset[0];
};

export const updateProduct = async (id: number, data: any) => {
    const pool = getPool();
    await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, data.name)
        .input('description', sql.NVarChar, data.description)
        .input('price', sql.Decimal, data.price)
        .query('UPDATE products SET name = @name, description = @description, price = @price, updated_at = GETDATE() WHERE product_id = @id');
    return getProductDetail(id);
};

export const deleteProduct = async (id: number) => {
    const pool = getPool();
    await pool.request().input('id', sql.Int, id)
        .query('UPDATE products SET deleted_at = GETDATE() WHERE product_id = @id');
};