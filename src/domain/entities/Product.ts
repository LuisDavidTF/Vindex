export interface Product {
    id: number;
    name: string;
    quantity: number;
    boxId: number | null;
    brand: string | null;
    category: string | null;
    expirationDate: string | null;
    unitMeasure: string | null;
    status: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    boxName?: string | null; // Joined field
}
