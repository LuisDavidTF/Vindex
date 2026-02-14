import { db } from '../local/database';
import { products, boxes } from '../local/schema';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { desc, eq, getTableColumns } from 'drizzle-orm';

export class ProductRepositoryImpl implements ProductRepository {
    async getAll(): Promise<Product[]> {
        const result = await db
            .select({
                ...getTableColumns(products),
                boxName: boxes.name,
            })
            .from(products)
            .leftJoin(boxes, eq(products.boxId, boxes.id))
            .orderBy(desc(products.id));

        return result as unknown as Product[];
    }

    async getById(id: number): Promise<Product | null> {
        const result = await db.select().from(products).where(eq(products.id, id));
        return result.length > 0 ? (result[0] as unknown as Product) : null;
    }

    async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product> {
        const result = await db.insert(products).values({
            name: product.name,
            brand: product.brand,
            category: product.category,
            quantity: product.quantity,
            boxId: product.boxId,
            expirationDate: product.expirationDate,
            unitMeasure: product.unitMeasure,
            status: product.status,
            image: product.image,
        }).returning();

        return result[0] as unknown as Product;
    }

    async update(id: number, product: Partial<Product>): Promise<Product> {
        const result = await db.update(products)
            .set({
                ...product,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, id))
            .returning();

        if (result.length === 0) {
            throw new Error(`Product with id ${id} not found`);
        }

        return result[0] as unknown as Product;
    }

    async delete(id: number): Promise<void> {
        await db.delete(products).where(eq(products.id, id));
    }
}
