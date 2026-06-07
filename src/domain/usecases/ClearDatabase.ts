import { ProductRepository } from '../repositories/ProductRepository';
import { BoxRepository } from '../repositories/BoxRepository';

export class ClearDatabase {
    constructor(
        private productRepository: ProductRepository,
        private boxRepository: BoxRepository
    ) {}

    async execute(): Promise<void> {
        await this.productRepository.clearAll();
        await this.boxRepository.clearAll();
    }
}
