import { Box } from '../entities/Box';

export interface BoxRepository {
    getAll(): Promise<Box[]>;
    getOrCreate(name: string): Promise<Box>;
    clearAll(): Promise<void>;
}
