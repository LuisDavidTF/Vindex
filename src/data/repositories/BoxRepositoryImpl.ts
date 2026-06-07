import { eq, gt } from 'drizzle-orm';
import { db, expoDb } from '../local/database';
import { boxes } from '../local/schema';
import { Box } from '../../domain/entities/Box';
import { BoxRepository } from '../../domain/repositories/BoxRepository';

export class BoxRepositoryImpl implements BoxRepository {
    async getAll(): Promise<Box[]> {
        const result = await db.select().from(boxes).orderBy(boxes.name);
        return result.map(b => ({
            id: b.id,
            name: b.name,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt
        }));
    }

    async getOrCreate(name: string): Promise<Box> {
        // Check if exists (case insensitive for user friendliness?)
        // SQLite 'LIKE' is case insensitive for ASCII characters by default
        const existing = await db.select().from(boxes).where(eq(boxes.name, name)).limit(1);

        if (existing.length > 0) {
            return {
                ...existing[0],
                createdAt: existing[0].createdAt,
                updatedAt: existing[0].updatedAt
            };
        }

        // Create
        const result = await db.insert(boxes).values({
            name,
        }).returning();

        return {
            ...result[0],
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt
        };
    }

    async clearAll(): Promise<void> {
        await expoDb.execAsync('DELETE FROM boxes;');
    }
}
