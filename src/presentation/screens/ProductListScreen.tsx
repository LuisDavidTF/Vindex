import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, useTheme, Chip, Searchbar, IconButton, Menu, Divider } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { Plus, AlertCircle, XCircle, Search, Settings } from 'lucide-react-native';
import { useProductStore } from '../store/useProductStore';
import AddProductModal from '../components/ui/AddProductModal';
import ProductDetailsModal from '../components/ui/ProductDetailsModal';
import ImportWizardModal from '../components/ui/ImportWizardModal';
import { calculateExpirationStatus } from '../../domain/logic/expirationLogic';
import ProductCardItem from '../components/ProductCardItem';
import { Product } from '../../domain/entities/Product';

export default function ProductListScreen() {
    const theme = useTheme();
    const router = useRouter();
    const loadProducts = useProductStore((state) => state.loadProducts);
    const products = useProductStore((state) => state.products);
    const deleteProduct = useProductStore((state) => state.deleteProduct);
    const updateProductStock = useProductStore((state) => state.updateProductStock);
    const wipeDatabase = useProductStore((state) => state.wipeDatabase);
    const searchQuery = useProductStore((state) => state.searchQuery);
    const setSearchQuery = useProductStore((state) => state.setSearchQuery);
    const getUniqueLineas = useProductStore((state) => state.getUniqueLineas);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'expired'>('all');
    const [selectedLinea, setSelectedLinea] = useState<string>('all');

    // Modals & Menu state
    const [isImportVisible, setIsImportVisible] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

    const handleAdd = () => {
        setProductToEdit(null);
        setIsModalVisible(true);
    };

    // Helper to strip accents/diacritics for searching
    const normalizeString = (str: string | null | undefined): string => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    // Pre-seeded line options merged with unique lines from products in DB
    const defaultLineas = ['Ekos', 'Todo Día', 'Chronos', 'JF9'];
    const uniqueLineas = getUniqueLineas();
    const allLineas = useMemo(() => {
        return Array.from(new Set([...defaultLineas, ...uniqueLineas]));
    }, [uniqueLineas]);

    // Pre-normalize product fields for search optimization (only when products array changes)
    const normalizedProducts = useMemo(() => {
        return products.map(product => ({
            ...product,
            _normProducto: normalizeString(product.producto),
            _normMarca: normalizeString(product.marca),
            _normLinea: normalizeString(product.linea),
            _normBoxName: normalizeString(product.boxName),
        }));
    }, [products]);

    // Filter products locally
    const filteredProducts = useMemo(() => {
        let result = normalizedProducts;

        // 1. Filter by Search Query (Accent & Case Insensitive)
        if (searchQuery) {
            const normQuery = normalizeString(searchQuery);
            result = result.filter(product => {
                const nameMatch = product._normProducto.includes(normQuery);
                const brandMatch = product._normMarca.includes(normQuery);
                const categoryMatch = product._normLinea.includes(normQuery);
                const boxMatch = product._normBoxName.includes(normQuery);
                return nameMatch || brandMatch || categoryMatch || boxMatch;
            });
        }

        // 2. Filter by Expiration Status
        if (filterStatus !== 'all') {
            result = result.filter(product => {
                const status = calculateExpirationStatus(product.fechaCaducidad);
                if (filterStatus === 'expired') return status === 'expired';
                if (filterStatus === 'warning') return status === 'warning' || status === 'critical';
                return true;
            });
        }

        // 3. Filter by Línea (Category)
        if (selectedLinea !== 'all') {
            const normSelected = normalizeString(selectedLinea);
            result = result.filter(product => {
                return product._normLinea === normSelected;
            });
        }

        return result;
    }, [normalizedProducts, searchQuery, filterStatus, selectedLinea]);

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = useCallback(async (id: number) => {
        await deleteProduct(id);
    }, [deleteProduct]);

    const handleEdit = useCallback((product: Product) => {
        setProductToEdit(product);
        setIsModalVisible(true);
    }, []);

    const handleProductPress = useCallback((product: Product) => {
        setSelectedProduct(product);
        setIsDetailsVisible(true);
    }, []);

    const handleWipeDatabase = () => {
        setMenuVisible(false);
        Alert.alert(
            'Formatear Aplicación',
            '¿Estás seguro de que deseas limpiar la base de datos? Esto borrará de forma permanente todos los productos y cajas registrados.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar Todo',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirmación Final',
                            'Esta acción NO se puede deshacer. ¿Confirmas que deseas borrar todo permanentemente?',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Sí, Borrar Todo',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await wipeDatabase();
                                            Alert.alert('Éxito', 'La aplicación ha sido formateada y los datos eliminados.');
                                        } catch (err) {
                                            Alert.alert('Error', 'Hubo un error al vaciar los datos.');
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const renderItem = useCallback(({ item }: { item: Product }) => {
        return (
            <ProductCardItem
                product={item}
                onPress={handleProductPress}
            />
        );
    }, [handleProductPress]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Settings Menu Button */}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <IconButton
                                        icon={({ size, color }) => <Settings size={size} color={color} />}
                                        onPress={() => setMenuVisible(true)}
                                        accessibilityLabel="Opciones"
                                    />
                                }
                            >
                                <Menu.Item
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setIsImportVisible(true);
                                    }}
                                    title="Importar Excel / CSV"
                                    leadingIcon="file-excel"
                                />
                                <Divider />
                                <Menu.Item
                                    onPress={handleWipeDatabase}
                                    title="Limpiar Base de Datos"
                                    titleStyle={{ color: theme.colors.error }}
                                    leadingIcon="trash-can"
                                />
                            </Menu>
                        </View>
                    ),
                }}
            />

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Buscar producto, marca, línea..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    elevation={1}
                    icon={({ size, color }) => <Search size={size} color={color} />}
                />
                
                {/* Status Filters scroll */}
                <View style={styles.filterRow}>
                    <Text variant="labelMedium" style={[styles.filterLabel, { color: theme.colors.outline }]}>Estado:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        <Chip
                            selected={filterStatus === 'all'}
                            onPress={() => setFilterStatus('all')}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            Todos
                        </Chip>
                        <Chip
                            selected={filterStatus === 'warning'}
                            onPress={() => setFilterStatus('warning')}
                            style={styles.chip}
                            icon={({ size, color }) => <AlertCircle size={size} color={color} />}
                            showSelectedOverlay
                        >
                            Por Vencer
                        </Chip>
                        <Chip
                            selected={filterStatus === 'expired'}
                            onPress={() => setFilterStatus('expired')}
                            style={styles.chip}
                            icon={({ size, color }) => <XCircle size={size} color={color} />}
                            showSelectedOverlay
                        >
                            Vencidos
                        </Chip>
                    </ScrollView>
                </View>

                {/* Línea Filters scroll */}
                <View style={[styles.filterRow, { marginTop: 8 }]}>
                    <Text variant="labelMedium" style={[styles.filterLabel, { color: theme.colors.outline }]}>Línea:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        <Chip
                            selected={selectedLinea === 'all'}
                            onPress={() => setSelectedLinea('all')}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            Todas
                        </Chip>
                        {allLineas.map((linea) => (
                            <Chip
                                key={linea}
                                selected={selectedLinea === linea}
                                onPress={() => setSelectedLinea(linea)}
                                style={styles.chip}
                                showSelectedOverlay
                            >
                                {linea}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text variant="bodyLarge">
                            {searchQuery ? 'No se encontraron productos' : 'No hay productos. ¡Agrega uno o impórtalos!'}
                        </Text>
                    </View>
                }
            />

            <FAB
                icon={({ size, color }) => <Plus size={size} color={color} />}
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={handleAdd}
            />

            {/* Modal to Add/Edit Product */}
            <AddProductModal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                productToEdit={productToEdit}
            />

            {/* Modal to View Product Details */}
            <ProductDetailsModal
                visible={isDetailsVisible}
                onDismiss={() => {
                    setIsDetailsVisible(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Excel Import Wizard Modal */}
            <ImportWizardModal
                visible={isImportVisible}
                onDismiss={() => setIsImportVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchBar: {
        backgroundColor: 'white',
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        fontWeight: 'bold',
        marginRight: 8,
        width: 50,
    },
    filterScroll: {
        gap: 8,
    },
    chip: {
        marginRight: 8,
    },
    list: {
        padding: 16,
        paddingTop: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
});
