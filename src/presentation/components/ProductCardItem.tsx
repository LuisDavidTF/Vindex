import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme, Chip } from 'react-native-paper';
import { Package } from 'lucide-react-native';
import { Product } from '../../domain/entities/Product';
import { formatMexicanDate, calculateExpirationStatus, getStatusColor, getStatusLabel } from '../../domain/logic/expirationLogic';

interface ProductCardItemProps {
    product: Product;
    onPress: (product: Product) => void;
}

const ProductCardItem = React.memo(function ProductCardItem({ product, onPress }: ProductCardItemProps) {
    const theme = useTheme();

    const status = calculateExpirationStatus(product.fechaCaducidad);
    const statusColor = getStatusColor(status, theme);
    const statusLabel = getStatusLabel(status);
    const showStatus = status !== 'good';

    const handlePress = () => {
        onPress(product);
    };

    return (
        <Card style={styles.card} mode="elevated" onPress={handlePress}>
            <View style={styles.header}>
                {/* Left: Icon */}
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Package size={24} color={theme.colors.onSecondaryContainer} />
                </View>

                {/* Center: Info */}
                <View style={styles.infoContainer}>
                    <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                        {product.producto}
                    </Text>
                    <View style={styles.subtitleRow}>
                        <Text variant="bodySmall" style={{ color: 'gray', fontWeight: 'bold' }}>
                            {product.stockActual} uds
                        </Text>
                        {product.marca && (
                            <Text variant="bodySmall" style={{ color: 'gray' }}>
                                • {product.marca}
                            </Text>
                        )}
                        {product.boxName && (
                            <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '500' }}>
                                • {product.boxName}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right: Status */}
                <View style={styles.rightColumn}>
                    <View style={styles.statusContainer}>
                        {showStatus && (
                            <View style={{ alignItems: 'flex-end' }}>
                                <Chip
                                    textStyle={{ color: 'white', fontSize: 10, marginVertical: -4 }}
                                    style={{ backgroundColor: statusColor, height: 24, marginBottom: 4 }}
                                    compact
                                >
                                    {statusLabel}
                                </Chip>
                                <Text variant="labelSmall" style={{ color: statusColor, fontWeight: 'bold' }}>
                                    {formatMexicanDate(product.fechaCaducidad || '')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Card>
    );
});

export default ProductCardItem;

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    rightColumn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
});
