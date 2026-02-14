import { Product } from '../entities/Product';
import { ProductRepository } from '../repositories/ProductRepository';

export class UpdateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number, product: Partial<Product>): Promise<Product> {
        return this.productRepository.update(id, product);
    }
}
