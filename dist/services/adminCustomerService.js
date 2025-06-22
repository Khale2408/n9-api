"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerDetail = exports.getCustomers = void 0;
const database_1 = require("../config/database");
const mssql_1 = __importDefault(require("mssql"));
const getCustomers = async () => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request().query('SELECT * FROM customers WHERE deleted_at IS NULL');
    return result.recordset;
};
exports.getCustomers = getCustomers;
const getCustomerDetail = async (id) => {
    const pool = (0, database_1.getPool)();
    const result = await pool.request().input('id', mssql_1.default.Int, id)
        .query('SELECT * FROM customers WHERE customer_id = @id');
    return result.recordset[0];
};
exports.getCustomerDetail = getCustomerDetail;
const updateCustomer = async (id, data) => {
    const pool = (0, database_1.getPool)();
    await pool.request()
        .input('id', mssql_1.default.Int, id)
        .input('full_name', mssql_1.default.NVarChar, data.full_name)
        .input('phone', mssql_1.default.NVarChar, data.phone)
        .query('UPDATE customers SET full_name = @full_name, phone = @phone WHERE customer_id = @id');
    return (0, exports.getCustomerDetail)(id);
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (id) => {
    const pool = (0, database_1.getPool)();
    await pool.request().input('id', mssql_1.default.Int, id)
        .query('UPDATE customers SET deleted_at = GETDATE() WHERE customer_id = @id');
};
exports.deleteCustomer = deleteCustomer;
