// src/services/productService.ts
import { productRepository, NewProductData, UpdateProductData } from '../repositories/productRepository';
import { NotFoundError } from '../common/exceptions/apiError';

class ProductService {
    public async getAllProducts() {
        return await productRepository.findAll();
    }

    public async getProductById(id: number) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new NotFoundError(`Product with ID ${id} not found`);
        }
        return product;
    }

    public async createProduct(productData: NewProductData) {
        return await productRepository.create(productData);
    }

    public async updateProduct(id: number, productData: UpdateProductData) {
        const existingProduct = await productRepository.findById(id);
        if (!existingProduct) {
            throw new NotFoundError(`Product with ID ${id} not found, cannot update.`);
        }
        return await productRepository.update(id, productData);
    }

    /**
     * HÀM MỚI: Xử lý nghiệp vụ xóa sản phẩm
     * @param id ID sản phẩm cần xóa
     */
    public async deleteProduct(id: number) {
        const existingProduct = await productRepository.findById(id);
        if (!existingProduct) {
            throw new NotFoundError(`Product with ID ${id} not found, cannot delete.`);
        }
        await productRepository.deleteById(id);
    }
}

export const productService = new ProductService();