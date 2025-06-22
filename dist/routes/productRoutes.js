"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = productRoutes;
const productController_1 = require("../controllers/productController");
async function productRoutes(fastify) {
    // Get all products with filters
    fastify.get('/', productController_1.getAllProductsHandler);
    // Search products
    fastify.get('/search', productController_1.searchProductsHandler);
    // Get featured products
    fastify.get('/featured', productController_1.getFeaturedProductsHandler);
    // Get product by ID
    fastify.get('/:id', productController_1.getProductByIdHandler);
    // Get product by slug
    fastify.get('/slug/:slug', productController_1.getProductBySlugHandler);
    // Get related products
    fastify.get('/:id/related', productController_1.getRelatedProductsHandler);
    // Test endpoint
    fastify.get('/test/info', async (request, reply) => {
        return {
            message: 'Product routes working!',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET / - Get all products with filters',
                'GET /search?q=keyword - Search products',
                'GET /featured - Get featured products',
                'GET /:id - Get product by ID',
                'GET /slug/:slug - Get product by slug',
                'GET /:id/related - Get related products'
            ],
            example_requests: [
                'GET /api/v1/products?page=1&limit=10',
                'GET /api/v1/products/search?q=iphone',
                'GET /api/v1/products/featured?limit=5',
                'GET /api/v1/products/1',
                'GET /api/v1/products/slug/iphone-15-pro-max',
                'GET /api/v1/products/1/related?limit=8'
            ]
        };
    });
}
