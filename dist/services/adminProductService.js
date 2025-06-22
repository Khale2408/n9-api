"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductDetail = exports.getProducts = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
const getProducts = async () => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request().query('SELECT * FROM products WHERE deleted_at IS NULL');
    return result.recordset;
};
exports.getProducts = getProducts;
const getProductDetail = async (id) => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request().input('id', mssql_1.default.Int, id)
        .query('SELECT * FROM products WHERE product_id = @id');
    return result.recordset[0];
};
exports.getProductDetail = getProductDetail;
const createProduct = async (data) => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request()
        .input('name', mssql_1.default.NVarChar, data.name)
        .input('description', mssql_1.default.NVarChar, data.description)
        .input('price', mssql_1.default.Decimal, data.price)
        .query('INSERT INTO products (name, description, price, created_at, updated_at) OUTPUT INSERTED.* VALUES (@name, @description, @price, GETDATE(), GETDATE())');
    return result.recordset[0];
};
exports.createProduct = createProduct;
const updateProduct = async (id, data) => {
    const pool = (0, database_1.getPool)();
    await pool.request()
        .input('id', mssql_1.default.Int, id)
        .input('name', mssql_1.default.NVarChar, data.name)
        .input('description', mssql_1.default.NVarChar, data.description)
        .input('price', mssql_1.default.Decimal, data.price)
        .query('UPDATE products SET name = @name, description = @description, price = @price, updated_at = GETDATE() WHERE product_id = @id');
    return (0, exports.getProductDetail)(id);
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    const pool = (0, database_1.getPool)();
    await pool.request().input('id', mssql_1.default.Int, id)
        .query('UPDATE products SET deleted_at = GETDATE() WHERE product_id = @id');
};
exports.deleteProduct = deleteProduct;
