import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Chip, Button } from 'react-native-paper';

import { Package, ChevronDown, ChevronUp, Trash2, Plus, Minus, Pencil } from 'lucide-react-native';
import { Product } from '../../domain/entities/Product';
import { formatMexicanDate, calculateExpirationStatus, getStatusColor, getStatusLabel, ExpirationStatus } from '../../domain/logic/expirationLogic';

interface ProductCardItemProps {
    product: Product;
    onDelete: (id: number) => void;
    onUpdateQuantity: (id: number, change: number) => void;
    onEdit: (product: Product) => void;
}

export default function ProductCardItem({ product, onDelete, onUpdateQuantity, onEdit }: ProductCardItemProps) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    const status = calculateExpirationStatus(product.expirationDate);
    const statusColor = getStatusColor(status, theme);
    const statusLabel = getStatusLabel(status);
    const showStatus = status !== 'good';

    return (
        <Card style={styles.card} mode="elevated" onPress={() => setExpanded(!expanded)}>
            <View style={styles.header}>
                {/* Left: Icon */}
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Package size={24} color={theme.colors.onSecondaryContainer} />
                </View>

                {/* Center: Info */}
                <View style={styles.infoContainer}>
                    <Text variant="titleMedium" style={styles.title}>
                        {product.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: 'gray' }}>
                        {product.quantity} unidades
                    </Text>
                </View>

                {/* Right: Status & Chevron */}
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
                                    {formatMexicanDate(product.expirationDate || '')}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.chevronContainer}>
                        {expanded ? <ChevronUp size={24} color={theme.colors.outline} /> : <ChevronDown size={24} color={theme.colors.outline} />}
                    </View>
                </View>
            </View>

            {/* Expanded Details */}
            {expanded && (
                <View style={[styles.details, { borderTopColor: theme.colors.outlineVariant }]}>

                    {/* Quantity Controls */}
                    <View style={styles.quantityRow}>
                        <Text variant="bodyMedium" style={{ marginRight: 16 }}>Cantidad:</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                onPress={() => onUpdateQuantity(product.id, -1)}
                                style={[styles.qtyBtn, { borderColor: theme.colors.outline }]}
                            >
                                <Minus size={20} color={theme.colors.onSurface} />
                            </TouchableOpacity>
                            <Text variant="titleMedium" style={styles.qtyText}>{product.quantity}</Text>
                            <TouchableOpacity
                                onPress={() => onUpdateQuantity(product.id, 1)}
                                style={[styles.qtyBtn, { backgroundColor: theme.colors.primaryContainer, borderWidth: 0 }]}
                            >
                                <Plus size={20} color={theme.colors.onPrimaryContainer} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Metadata */}
                    <View style={styles.detailRow}>
                        <DataLabel label="Marca" value={product.brand} />
                        <DataLabel label="Categoría" value={product.category} />
                    </View>

                    {/* Location & Delete */}
                    <View style={styles.detailRow}>
                        <DataLabel
                            label="Ubicación"
                            value={product.boxName ? (
                                !isNaN(Number(product.boxName)) ? `Caja ${product.boxName}` : `${product.boxName}`
                            ) : 'Sin Asignar'}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                            <Button
                                mode="text"
                                textColor={theme.colors.primary}
                                icon={({ size, color }) => <Pencil size={size} color={color} />}
                                onPress={() => onEdit(product)}
                                compact
                            >
                                Editar
                            </Button>
                            <Button
                                mode="text"
                                textColor={theme.colors.error}
                                icon={({ size, color }) => <Trash2 size={size} color={color} />}
                                onPress={() => onDelete(product.id)}
                                compact
                            >
                                Eliminar
                            </Button>
                        </View>
                    </View>
                </View>
            )}

        </Card>
    );
}

const DataLabel = ({ label, value }: any) => (
    <View style={styles.dataCol}>
        <Text variant="labelSmall" style={{ color: 'gray' }}>{label}</Text>
        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{value || '-'}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        padding: 12,
        paddingVertical: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
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
    rightColumn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusContainer: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    chevronContainer: {
        justifyContent: 'center',
        height: 48,
        paddingLeft: 4,
    },
    // Expanded
    details: {
        marginTop: 12,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    qtyText: {
        marginHorizontal: 16,
        fontWeight: 'bold',
        minWidth: 20,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dataCol: {
        flex: 1,
        marginRight: 8,
    },
});
