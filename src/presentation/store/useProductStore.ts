import { create } from 'zustand';
import { Product } from '../../domain/entities/Product';
import { ProductRepositoryImpl } from '../../data/repositories/ProductRepositoryImpl';
import { BoxRepositoryImpl } from '../../data/repositories/BoxRepositoryImpl';
import { GetProducts } from '../../domain/usecases/GetProducts';
import { AddProduct } from '../../domain/usecases/AddProduct';
import { DeleteProduct } from '../../domain/usecases/DeleteProduct';
import { UpdateProduct } from '../../domain/usecases/UpdateProduct';
import { GetOrCreateBox } from '../../domain/usecases/GetOrCreateBox';
import { ClearDatabase } from '../../domain/usecases/ClearDatabase';
import { ImportProducts, ProductImportInput, DuplicateStrategy } from '../../domain/usecases/ImportProducts';

// Dependency Injection (Simple implementation)
const productRepository = new ProductRepositoryImpl();
const boxRepository = new BoxRepositoryImpl();

const getProductsUseCase = new GetProducts(productRepository);
const addProductUseCase = new AddProduct(productRepository);
const updateProductUseCase = new UpdateProduct(productRepository);
const deleteProductUseCase = new DeleteProduct(productRepository);
const getOrCreateBoxUseCase = new GetOrCreateBox(boxRepository);
const clearDatabaseUseCase = new ClearDatabase(productRepository, boxRepository);
const importProductsUseCase = new ImportProducts(productRepository, boxRepository);

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;

    loadProducts: () => Promise<void>;
    addProduct: (product: {
        producto: string;
        stockActual: number;
        fechaCaducidad: string | null;
        marca?: string;
        linea?: string;
        boxName?: string;
        cantidadInicial?: number;
        cantidadVendida?: number;
        fechaVenta?: string | null;
        estado?: string | null;
        unidadMedida?: string | null;
    }) => Promise<void>;
    editProduct: (id: number, product: Partial<Product> & { boxName?: string }) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    updateProductStock: (id: number, change: number) => Promise<void>;
    wipeDatabase: () => Promise<void>;
    getUniqueMarcas: () => string[];
    getUniqueLineas: () => string[];
    getUniqueProductos: () => string[];

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    getFilteredProducts: () => Product[];
    importProducts: (products: ProductImportInput[], strategy: DuplicateStrategy) => Promise<{ inserted: number; updated: number; ignored: number }>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,
    error: null,
    searchQuery: '',

    loadProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const products = await getProductsUseCase.execute();
            set({ products, isLoading: false });
        } catch (error) {
            console.error('Failed to load products:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            let boxId = null;
            if (productData.boxName) {
                const box = await getOrCreateBoxUseCase.execute(productData.boxName);
                boxId = box.id;
            }

            const newProduct = await addProductUseCase.execute({
                producto: productData.producto,
                stockActual: productData.stockActual,
                fechaCaducidad: productData.fechaCaducidad,
                marca: productData.marca || null,
                linea: productData.linea || null,
                boxId,
                unidadMedida: productData.unidadMedida || 'units',
                estado: productData.estado || 'active',
                image: null,
                cantidadInicial: productData.cantidadInicial !== undefined ? productData.cantidadInicial : productData.stockActual,
                cantidadVendida: productData.cantidadVendida !== undefined ? productData.cantidadVendida : 0,
                fechaVenta: productData.fechaVenta || null,
            });

            // Manually attach boxName for immediate UI update since create() doesn't return joined fields
            const productWithBox = {
                ...newProduct,
                boxName: productData.boxName || null
            };

            set((state) => ({ products: [productWithBox, ...state.products], isLoading: false }));
        } catch (error) {
            console.error('Failed to add product:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteProductUseCase.execute(id);
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            console.error('Failed to delete product:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    getUniqueMarcas: () => {
        const products = get().products;
        const marcas = new Set(products.map(p => p.marca).filter(Boolean));
        return Array.from(marcas) as string[];
    },

    getUniqueLineas: () => {
        const products = get().products;
        const lineas = new Set(products.map(p => p.linea).filter(Boolean));
        return Array.from(lineas) as string[];
    },

    getUniqueProductos: () => {
        const products = get().products;
        const productos = new Set(products.map(p => p.producto).filter(Boolean));
        return Array.from(productos) as string[];
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    updateProductStock: async (id, change) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;

        const newStock = Math.max(0, product.stockActual + change);
        if (newStock === product.stockActual) return;

        // Optimistic update
        set((state) => ({
            products: state.products.map(p =>
                p.id === id ? { ...p, stockActual: newStock } : p
            )
        }));

        try {
            await productRepository.update(id, { stockActual: newStock });
        } catch (error) {
            console.error('Failed to update stock:', error);
            // Rollback
            set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, stockActual: product.stockActual } : p
                )
            }));
        }
    },

    editProduct: async (id, productData) => {
        set({ isLoading: true, error: null });
        try {
            let boxId = undefined;
            if (productData.boxName !== undefined) {
                if (productData.boxName) {
                    const box = await getOrCreateBoxUseCase.execute(productData.boxName);
                    boxId = box.id;
                } else {
                    boxId = null;
                }
            }

            const updateData: Partial<Product> = {
                ...productData,
                boxId: boxId !== undefined ? boxId : undefined,
            };

            delete (updateData as any).boxName;

            await updateProductUseCase.execute(id, updateData);
            await get().loadProducts();
            set({ isLoading: false });
        } catch (error) {
            console.error('Failed to edit product:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    getFilteredProducts: () => {
        const { products, searchQuery } = get();
        if (!searchQuery) return products;

        const lowerQuery = searchQuery.toLowerCase();
        return products.filter(product => {
            const nameMatch = product.producto?.toLowerCase().includes(lowerQuery);
            const brandMatch = product.marca?.toLowerCase().includes(lowerQuery);
            const categoryMatch = product.linea?.toLowerCase().includes(lowerQuery);
            const boxMatch = product.boxName?.toLowerCase().includes(lowerQuery);
            return nameMatch || brandMatch || categoryMatch || boxMatch;
        });
    },

    importProducts: async (productsData, strategy) => {
        set({ isLoading: true, error: null });
        try {
            const result = await importProductsUseCase.execute(productsData, strategy);
            await get().loadProducts();
            set({ isLoading: false });
            return result;
        } catch (error) {
            console.error('Failed to import products:', error);
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    wipeDatabase: async () => {
        set({ isLoading: true, error: null });
        try {
            await clearDatabaseUseCase.execute();
            set({ products: [], isLoading: false });
        } catch (error) {
            console.error('Failed to wipe database:', error);
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },
}));
