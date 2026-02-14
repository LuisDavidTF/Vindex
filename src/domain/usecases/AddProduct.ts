import { Product } from '../entities/Product';
import { ProductRepository } from '../repositories/ProductRepository';

export class AddProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product> {
        return this.productRepository.create(product);
    }
}
