import { Product } from '../entities/Product';
import { ProductRepository } from '../repositories/ProductRepository';
import { BoxRepository } from '../repositories/BoxRepository';

export interface ProductImportInput {
    producto: string;
    stockActual: number;
    marca?: string | null;
    linea?: string | null;
    fechaCaducidad?: string | null;
    unidadMedida?: string | null;
    estado?: string | null;
    image?: string | null;
    boxName?: string | null;
    customFields?: Record<string, any> | null;
    cantidadInicial?: number | null;
    cantidadVendida?: number | null;
    fechaVenta?: string | null;
}

export type DuplicateStrategy = 'sum' | 'overwrite' | 'ignore' | 'duplicate';

export interface ImportResult {
    inserted: number;
    updated: number;
    ignored: number;
}

export class ImportProducts {
    constructor(
        private productRepository: ProductRepository,
        private boxRepository: BoxRepository
    ) { }

    async execute(products: ProductImportInput[], strategy: DuplicateStrategy): Promise<ImportResult> {
        const existingProducts = await this.productRepository.getAll();
        
        let inserted = 0;
        let updated = 0;
        let ignored = 0;

        // Cache box IDs to avoid querying DB repeatedly for the same boxName
        const boxCache: Record<string, number> = {};

        const getBoxId = async (boxName: string | null | undefined): Promise<number | null> => {
            if (!boxName) return null;
            const trimmed = boxName.trim();
            if (!trimmed) return null;
            
            if (boxCache[trimmed] !== undefined) {
                return boxCache[trimmed];
            }
            
            const box = await this.boxRepository.getOrCreate(trimmed);
            boxCache[trimmed] = box.id;
            return box.id;
        };

        for (const item of products) {
            const trimmedName = item.producto.trim();
            if (!trimmedName) {
                ignored++;
                continue;
            }

            const normName = trimmedName.toLowerCase();
            const normBrand = (item.marca || '').trim().toLowerCase();

            // Find duplicate
            const duplicate = existingProducts.find(p => {
                const pName = p.producto.trim().toLowerCase();
                const pBrand = (p.marca || '').trim().toLowerCase();
                return pName === normName && pBrand === normBrand;
            });

            if (duplicate && strategy !== 'duplicate') {
                if (strategy === 'ignore') {
                    ignored++;
                    continue;
                }

                if (strategy === 'sum') {
                    const newQuantity = duplicate.stockActual + item.stockActual;
                    const newInitialQuantity = (duplicate.cantidadInicial || 0) + (item.cantidadInicial !== undefined && item.cantidadInicial !== null ? item.cantidadInicial : item.stockActual);
                    const newSoldQuantity = (duplicate.cantidadVendida || 0) + (item.cantidadVendida || 0);

                    await this.productRepository.update(duplicate.id, {
                        stockActual: newQuantity,
                        cantidadInicial: newInitialQuantity,
                        cantidadVendida: newSoldQuantity,
                    });
                    updated++;
                } else if (strategy === 'overwrite') {
                    const boxId = await getBoxId(item.boxName);
                    
                    // Merge customFields if both exist, or overwrite
                    const newCustomFields = {
                        ...(duplicate.customFields || {}),
                        ...(item.customFields || {})
                    };

                    await this.productRepository.update(duplicate.id, {
                        producto: trimmedName,
                        stockActual: item.stockActual,
                        marca: item.marca || null,
                        linea: item.linea || null,
                        fechaCaducidad: item.fechaCaducidad || null,
                        unidadMedida: item.unidadMedida || duplicate.unidadMedida,
                        estado: item.estado || duplicate.estado,
                        boxId,
                        customFields: Object.keys(newCustomFields).length > 0 ? newCustomFields : null,
                        cantidadInicial: item.cantidadInicial !== undefined && item.cantidadInicial !== null ? item.cantidadInicial : item.stockActual,
                        cantidadVendida: item.cantidadVendida !== undefined && item.cantidadVendida !== null ? item.cantidadVendida : 0,
                        fechaVenta: item.fechaVenta || null,
                    });
                    updated++;
                }
            } else {
                // Insert new product
                const boxId = await getBoxId(item.boxName);
                
                await this.productRepository.create({
                    producto: trimmedName,
                    stockActual: item.stockActual,
                    marca: item.marca || null,
                    linea: item.linea || null,
                    fechaCaducidad: item.fechaCaducidad || null,
                    unidadMedida: item.unidadMedida || 'units',
                    estado: item.estado || 'active',
                    boxId,
                    image: item.image || null,
                    customFields: item.customFields || null,
                    cantidadInicial: item.cantidadInicial !== undefined && item.cantidadInicial !== null ? item.cantidadInicial : item.stockActual,
                    cantidadVendida: item.cantidadVendida !== undefined && item.cantidadVendida !== null ? item.cantidadVendida : 0,
                    fechaVenta: item.fechaVenta || null,
                });
                inserted++;
            }
        }

        return { inserted, updated, ignored };
    }
}
