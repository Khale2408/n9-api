// src/server.ts
import Fastify, { FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
// import { connectDB } from './config/database'; // TẠM THỜI VÔ HIỆU HÓA
import { productRoutes } from './routes/productRoutes'; 

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true 
});
const PORT = parseInt(process.env.PORT || '3000');

server.register(productRoutes, { prefix: '/api/v1/products' });

server.get('/', async (request, reply) => {
    return { message: 'Welcome to the Deployed Fastify API!' };
});

const start = async () => {
  try {
    // await connectDB(); // TẠM THỜI VÔ HIỆU HÓA

    // QUAN TRỌNG: Thêm host: '0.0.0.0' để Render có thể truy cập
    await server.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();