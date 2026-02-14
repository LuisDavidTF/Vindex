import { Product } from '../entities/Product';

export interface ProductRepository {
    getAll(): Promise<Product[]>;
    getById(id: number): Promise<Product | null>;
    create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product>;
    update(id: number, product: Partial<Product>): Promise<Product>;
    delete(id: number): Promise<void>;
}
