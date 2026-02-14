import React, { useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, Card, Button, Avatar, useTheme, Chip, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Plus, AlertCircle, XCircle, Search } from 'lucide-react-native';
import { useProductStore } from '../store/useProductStore';
import AddProductModal from '../components/ui/AddProductModal';
import { formatMexicanDate, calculateExpirationStatus, getStatusColor, getStatusLabel } from '../../domain/logic/expirationLogic';
import ProductCardItem from '../components/ProductCardItem';
import { Product } from '../../domain/entities/Product';

export default function ProductListScreen() {
    const theme = useTheme();
    const router = useRouter();
    const loadProducts = useProductStore((state) => state.loadProducts);
    const products = useProductStore((state) => state.products);
    const deleteProduct = useProductStore((state) => state.deleteProduct);
    const updateProductQuantity = useProductStore((state) => state.updateProductQuantity);
    const searchQuery = useProductStore((state) => state.searchQuery);
    const setSearchQuery = useProductStore((state) => state.setSearchQuery);

    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
    const [filterStatus, setFilterStatus] = React.useState<'all' | 'warning' | 'expired'>('all');

    const handleAdd = () => {
        setProductToEdit(null);
        setIsModalVisible(true);
    };

    // Filter products locally to avoid infinite loop in selector
    const filteredProducts = useMemo(() => {
        let result = products;

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(product => {
                const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
                const brandMatch = product.brand?.toLowerCase().includes(lowerQuery);
                const categoryMatch = product.category?.toLowerCase().includes(lowerQuery);
                const boxMatch = product.boxId?.toString().includes(lowerQuery);
                return nameMatch || brandMatch || categoryMatch || boxMatch;
            });
        }

        // 2. Filter by Status
        if (filterStatus !== 'all') {
            result = result.filter(product => {
                const status = calculateExpirationStatus(product.expirationDate);
                if (filterStatus === 'expired') return status === 'expired';
                if (filterStatus === 'warning') return status === 'warning' || status === 'critical';
                return true;
            });
        }

        return result;
    }, [products, searchQuery, filterStatus]);

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: number) => {
        await deleteProduct(id);
    };

    const handleUpdateQuantity = async (id: number, change: number) => {
        await updateProductQuantity(id, change);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsModalVisible(true);
    };

    const renderItem = ({ item }: { item: Product }) => {
        return (
            <ProductCardItem
                product={item}
                onDelete={handleDelete}
                onUpdateQuantity={handleUpdateQuantity}
                onEdit={handleEdit}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Buscar producto, marca, categoría..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    elevation={1}
                    icon={({ size, color }) => <Search size={size} color={color} />}
                />
                <View style={styles.filterContainer}>
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
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text variant="bodyLarge">
                            {searchQuery ? 'No se encontraron productos' : 'No hay productos. ¡Agrega uno!'}
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

            <AddProductModal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                productToEdit={productToEdit}
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
    filterContainer: {
        flexDirection: 'row',
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
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    }
});
