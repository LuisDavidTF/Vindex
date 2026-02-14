import { ProductRepository } from '../repositories/ProductRepository';

export class DeleteProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number): Promise<void> {
        return this.productRepository.delete(id);
    }
}
