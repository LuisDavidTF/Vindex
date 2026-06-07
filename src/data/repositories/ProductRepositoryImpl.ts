import { db, expoDb } from '../local/database';
import { products, boxes } from '../local/schema';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { desc, eq, getTableColumns, gt } from 'drizzle-orm';

export class ProductRepositoryImpl implements ProductRepository {
    private parseCustomFields(customFieldsStr: string | null): Record<string, any> | null {
        if (!customFieldsStr) return null;
        
        // Clean empty values
        const trimmed = customFieldsStr.trim();
        if (!trimmed) return null;

        try {
            // Check if it looks like a JSON object or array
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                return JSON.parse(trimmed);
            }
            // Fallback for plain strings
            return { valorOriginal: trimmed };
        } catch (e) {
            console.warn(`Failed to parse customFields JSON: "${customFieldsStr}"`, e);
            return { valorOriginal: customFieldsStr };
        }
    }

    private serializeCustomFields(customFieldsObj: Record<string, any> | null | undefined): string | null {
        if (!customFieldsObj) return null;
        try {
            return JSON.stringify(customFieldsObj);
        } catch (e) {
            console.error('Failed to stringify customFields object:', e);
            return null;
        }
    }

    async getAll(): Promise<Product[]> {
        const result = await db
            .select({
                ...getTableColumns(products),
                boxName: boxes.name,
            })
            .from(products)
            .leftJoin(boxes, eq(products.boxId, boxes.id))
            .orderBy(desc(products.id));

        return result.map(row => ({
            ...row,
            customFields: this.parseCustomFields(row.customFields),
        })) as unknown as Product[];
    }

    async getById(id: number): Promise<Product | null> {
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) return null;

        const row = result[0];
        return {
            ...row,
            customFields: this.parseCustomFields(row.customFields),
        } as unknown as Product;
    }

    async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product> {
        const customFieldsStr = this.serializeCustomFields(product.customFields);
        
        const result = await db.insert(products).values({
            producto: product.producto,
            marca: product.marca,
            linea: product.linea,
            stockActual: product.stockActual,
            boxId: product.boxId,
            fechaCaducidad: product.fechaCaducidad,
            unidadMedida: product.unidadMedida,
            estado: product.estado,
            image: product.image,
            customFields: customFieldsStr,
            cantidadInicial: product.cantidadInicial ?? 0,
            cantidadVendida: product.cantidadVendida ?? 0,
            fechaVenta: product.fechaVenta || null,
        }).returning();

        const row = result[0];
        return {
            ...row,
            customFields: product.customFields || null,
        } as unknown as Product;
    }

    async update(id: number, product: Partial<Product>): Promise<Product> {
        const updateData: any = {
            ...product,
        };

        if (product.customFields !== undefined) {
            updateData.customFields = this.serializeCustomFields(product.customFields);
        }

        const result = await db.update(products)
            .set({
                ...updateData,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, id))
            .returning();

        if (result.length === 0) {
            throw new Error(`Product with id ${id} not found`);
        }

        const row = result[0];
        return {
            ...row,
            customFields: this.parseCustomFields(row.customFields),
        } as unknown as Product;
    }

    async delete(id: number): Promise<void> {
        await db.delete(products).where(eq(products.id, id));
    }

    async clearAll(): Promise<void> {
        await expoDb.execAsync('DELETE FROM products;');
    }
}
