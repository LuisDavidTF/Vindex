import { Box } from '../entities/Box';
import { BoxRepository } from '../repositories/BoxRepository';

export class GetOrCreateBox {
    constructor(private boxRepository: BoxRepository) { }

    async execute(name: string): Promise<Box> {
        return this.boxRepository.getOrCreate(name);
    }
}
