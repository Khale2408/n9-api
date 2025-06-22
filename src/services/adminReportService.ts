import { getPool } from '../config/database';

export const getStatistics = async () => {
    const pool = getPool();
    const [orders, customers, products, revenue] = await Promise.all([
        pool.request().query('SELECT COUNT(*) as total_orders FROM orders'),
        pool.request().query('SELECT COUNT(*) as total_customers FROM customers WHERE deleted_at IS NULL'),
        pool.request().query('SELECT COUNT(*) as total_products FROM products WHERE deleted_at IS NULL'),
        pool.request().query('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = \'completed\'')
    ]);
    return {
        total_orders: orders.recordset[0].total_orders,
        total_customers: customers.recordset[0].total_customers,
        total_products: products.recordset[0].total_products,
        total_revenue: revenue.recordset[0].total_revenue || 0
    };
};