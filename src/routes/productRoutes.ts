// src/routes/productRoutes.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { 
    getAllProductsHandler, 
    getProductByIdHandler, 
    createProductHandler, 
    updateProductHandler,
    deleteProductHandler
} from '../controllers/productController';

export const productRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    fastify.get('/', getAllProductsHandler);
    fastify.get('/:id', getProductByIdHandler);

    // ĐẢM BẢO DÒNG NÀY TỒN TẠI
    fastify.post('/', createProductHandler); 

    fastify.put('/:id', updateProductHandler);
    fastify.delete('/:id', deleteProductHandler);
};