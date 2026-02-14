import { create } from 'zustand';
import { Product } from '../../domain/entities/Product';
import { ProductRepositoryImpl } from '../../data/repositories/ProductRepositoryImpl';
import { BoxRepositoryImpl } from '../../data/repositories/BoxRepositoryImpl';
import { GetProducts } from '../../domain/usecases/GetProducts';
import { AddProduct } from '../../domain/usecases/AddProduct';
import { DeleteProduct } from '../../domain/usecases/DeleteProduct';
import { UpdateProduct } from '../../domain/usecases/UpdateProduct';
import { GetOrCreateBox } from '../../domain/usecases/GetOrCreateBox';

// Dependency Injection (Simple implementation)
const productRepository = new ProductRepositoryImpl();
const boxRepository = new BoxRepositoryImpl();

const getProductsUseCase = new GetProducts(productRepository);
const addProductUseCase = new AddProduct(productRepository);
const updateProductUseCase = new UpdateProduct(productRepository);
const deleteProductUseCase = new DeleteProduct(productRepository);
const getOrCreateBoxUseCase = new GetOrCreateBox(boxRepository);

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;

    loadProducts: () => Promise<void>;
    addProduct: (product: {
        name: string;
        quantity: number;
        expirationDate: string | null;
        brand?: string;
        category?: string;
        boxName?: string;
    }) => Promise<void>;
    editProduct: (id: number, product: Partial<Product> & { boxName?: string }) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>; // Renamed from removeProduct
    updateProductQuantity: (id: number, change: number) => Promise<void>;
    getUniqueBrands: () => string[];
    getUniqueCategories: () => string[];
    getUniqueNames: () => string[];

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,
    error: null, // Initialize error state
    searchQuery: '', // Initialize search query

    loadProducts: async () => { // Renamed from fetchProducts
        set({ isLoading: true, error: null }); // Reset error on new load
        try {
            const products = await getProductsUseCase.execute();
            set({ products, isLoading: false });
        } catch (error) {
            console.error('Failed to load products:', error); // Updated log message
            set({ error: (error as Error).message, isLoading: false }); // Set error state
        }
    },

    addProduct: async (productData) => { // Changed parameter to productData
        set({ isLoading: true, error: null }); // Reset error on new add
        try {
            let boxId = null;
            if (productData.boxName) {
                const box = await getOrCreateBoxUseCase.execute(productData.boxName);
                boxId = box.id;
            }

            const newProduct = await addProductUseCase.execute({
                name: productData.name,
                quantity: productData.quantity,
                expirationDate: productData.expirationDate,
                brand: productData.brand || null,
                category: productData.category || null,
                boxId,
                unitMeasure: 'units',
                status: 'active',
                image: null
            });

            // Manually attach boxName for immediate UI update since create() doesn't return joined fields
            const productWithBox = {
                ...newProduct,
                boxName: productData.boxName || null
            };

            set((state) => ({ products: [productWithBox, ...state.products], isLoading: false }));
        } catch (error) {
            console.error('Failed to add product:', error);
            set({ error: (error as Error).message, isLoading: false }); // Set error state
        }
    },

    deleteProduct: async (id) => { // Renamed from removeProduct
        set({ isLoading: true, error: null }); // Reset error on new delete
        try {
            await deleteProductUseCase.execute(id);
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
                isLoading: false, // Set isLoading to false here
            }));
        } catch (error) {
            console.error('Failed to delete product:', error);
            set({ error: (error as Error).message, isLoading: false }); // Set error state
        }
    },

    getUniqueBrands: () => {
        const products = get().products;
        const brands = new Set(products.map(p => p.brand).filter(Boolean));
        return Array.from(brands) as string[];
    },

    getUniqueCategories: () => {
        const products = get().products;
        const categories = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(categories) as string[];
    },
    getUniqueNames: () => {
        const products = get().products;
        const names = new Set(products.map(p => p.name).filter(Boolean));
        return Array.from(names) as string[];
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    updateProductQuantity: async (id, change) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;

        const newQuantity = Math.max(0, product.quantity + change);
        if (newQuantity === product.quantity) return; // No change

        // Optimistic update
        set((state) => ({
            products: state.products.map(p =>
                p.id === id ? { ...p, quantity: newQuantity } : p
            )
        }));

        try {
            // We reuse addProductUseCase logic or create a new one? 
            // Ideally we should have an UpdateProduct usecase.
            // For now, let's use a direct repository call via a new generic update action or similar.
            // But wait, we don't have the repository exposed here directly easily without breaking clean arch strictly.
            // Let's add an UpdateProduct usecase properly or just use the repository instance we have in the file.

            // Since we defined the repository instances at the top of this file:
            // const productRepository = new ProductRepositoryImpl();
            // We can just call update directly for now to be pragmatic, or add the usecase. 
            // Detailed instructions said: "Update repository/usecase to support partial updates".
            // The repository already supports partial updates.

            await productRepository.update(id, { quantity: newQuantity });
        } catch (error) {
            console.error('Failed to update quantity:', error);
            // Rollback
            set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, quantity: product.quantity } : p
                )
            }));
        }
    },

    editProduct: async (id, productData) => {
        set({ isLoading: true, error: null });
        try {
            let boxId = undefined;
            // Only process box if provided (it might be unchanged, but if passed as string we check)
            if (productData.boxName !== undefined) {
                if (productData.boxName) {
                    const box = await getOrCreateBoxUseCase.execute(productData.boxName);
                    boxId = box.id;
                } else {
                    boxId = null; // Explicitly set to null if empty string passed
                }
            }

            const updateData: Partial<Product> = {
                ...productData,
                boxId: boxId !== undefined ? boxId : undefined, // Only update if changed
            };

            // Remove boxName from updateData as it's not in Product table directly (it's joined)
            delete (updateData as any).boxName;

            // Logic for handling undefined/null values for partial updates is handled by repository
            // But we need to be careful not to overwrite with undefined if we want to keep existing.
            // The UI should pass all fields or only changed ones. 
            // Ideally we pass everything from the form.

            await updateProductUseCase.execute(id, updateData);

            // Refresh list to get fresh joins (box names etc)
            // Or update local state optimistically
            await get().loadProducts();

            set({ isLoading: false });
        } catch (error) {
            console.error('Failed to edit product:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    getFilteredProducts: () => { // New selector for filtered products
        const { products, searchQuery } = get();
        if (!searchQuery) return products;

        const lowerQuery = searchQuery.toLowerCase();
        return products.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
            const brandMatch = product.brand?.toLowerCase().includes(lowerQuery);
            const categoryMatch = product.category?.toLowerCase().includes(lowerQuery);
            const boxMatch = product.boxName?.toLowerCase().includes(lowerQuery); // Search by box name too
            return nameMatch || brandMatch || categoryMatch || boxMatch;
        });
    },
}));
