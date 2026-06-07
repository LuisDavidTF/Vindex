export interface Product {
    id: number;
    producto: string;
    stockActual: number;
    boxId: number | null;
    marca: string | null;
    linea: string | null;
    fechaCaducidad: string | null;
    unidadMedida: string | null;
    estado: string | null;
    image: string | null;
    customFields?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    boxName?: string | null; // Joined field
    cantidadInicial: number;
    cantidadVendida: number;
    fechaVenta: string | null;
}
