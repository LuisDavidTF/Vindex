import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Divider, Chip } from 'react-native-paper';
import { Calendar, Box, Trash2, Edit2, Package, Tag, Layers, Compass, Clipboard } from 'lucide-react-native';
import { Product } from '../../../domain/entities/Product';
import { formatMexicanDate, calculateExpirationStatus, getStatusColor, getStatusLabel } from '../../../domain/logic/expirationLogic';

const adjustOpacity = (color: string, opacity: number): string => {
    if (!color) return 'rgba(0,0,0,0)';
    
    // Hex colors
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // RGB or RGBA colors
    if (color.startsWith('rgb')) {
        const matches = color.match(/\d+(\.\d+)?/g);
        if (matches && matches.length >= 3) {
            const r = matches[0];
            const g = matches[1];
            const b = matches[2];
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }
    
    return color;
};

interface ProductDetailsModalProps {
    visible: boolean;
    onDismiss: () => void;
    product: Product | null;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

export default function ProductDetailsModal({ visible, onDismiss, product, onEdit, onDelete }: ProductDetailsModalProps) {
    const theme = useTheme();

    if (!product) return null;

    const expStatus = calculateExpirationStatus(product.fechaCaducidad);
    const statusColor = getStatusColor(expStatus, theme);
    const statusLabel = getStatusLabel(expStatus);

    const hasCustomFields = product.customFields && typeof product.customFields === 'object' && Object.keys(product.customFields).length > 0;

    const handleDeletePress = () => {
        Alert.alert(
            'Eliminar Producto',
            `¿Estás seguro de que deseas eliminar "${product.producto}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        onDelete(product.id);
                        onDismiss();
                    }
                }
            ]
        );
    };

    const handleEditPress = () => {
        onEdit(product);
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header: Title and Status Badge */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Package size={32} color={theme.colors.primary} style={styles.headerIcon} />
                            <View style={styles.titleTextContainer}>
                                <Text variant="headlineSmall" style={styles.nameText}>
                                    {product.producto}
                                </Text>
                                {product.marca && (
                                    <Text variant="bodyLarge" style={[styles.brandText, { color: theme.colors.outline }]}>
                                        Marca: {product.marca}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.badgeRow}>
                            {product.linea && (
                                <Chip icon={() => <Tag size={14} color={theme.colors.onSecondaryContainer} />} style={styles.categoryChip}>
                                    {product.linea}
                                </Chip>
                            )}
                            <Chip
                                style={{ backgroundColor: adjustOpacity(statusColor, 0.15) }}
                                textStyle={{ color: statusColor, fontWeight: 'bold' }}
                            >
                                {statusLabel}
                            </Chip>
                        </View>
                    </View>
 
                    <Divider style={styles.divider} />

                    {/* Standard Fields Info */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Información General
                    </Text>

                    <View style={styles.grid}>
                        <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Layers size={20} color={theme.colors.primary} />
                            <View style={styles.gridTextContainer}>
                                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>STOCK ACTUAL</Text>
                                <Text variant="bodyLarge" style={styles.gridValue}>
                                    {product.stockActual} {product.unidadMedida || 'unidades'}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Box size={20} color={theme.colors.primary} />
                            <View style={styles.gridTextContainer}>
                                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>UBICACIÓN / CAJA</Text>
                                <Text variant="bodyLarge" style={styles.gridValue}>
                                    {product.boxName || 'Sin Caja'}
                                </Text>
                            </View>
                        </View>

                        {product.cantidadInicial !== undefined && product.cantidadInicial !== 0 && (
                            <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Layers size={20} color={theme.colors.primary} />
                                <View style={styles.gridTextContainer}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>CANT. INICIAL</Text>
                                    <Text variant="bodyLarge" style={styles.gridValue}>
                                        {product.cantidadInicial} {product.unidadMedida || 'unidades'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {product.cantidadVendida !== undefined && product.cantidadVendida !== 0 && (
                            <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Layers size={20} color={theme.colors.primary} />
                                <View style={styles.gridTextContainer}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>CANT. VENDIDA</Text>
                                    <Text variant="bodyLarge" style={styles.gridValue}>
                                        {product.cantidadVendida} {product.unidadMedida || 'unidades'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {product.fechaCaducidad && (
                            <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Calendar size={20} color={statusColor} />
                                <View style={styles.gridTextContainer}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>CADUCIDAD</Text>
                                    <Text variant="bodyLarge" style={[styles.gridValue, { color: statusColor, fontWeight: '600' }]}>
                                        {formatMexicanDate(product.fechaCaducidad)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {product.fechaVenta && (
                            <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Calendar size={20} color={theme.colors.primary} />
                                <View style={styles.gridTextContainer}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>FECHA DE VENTA</Text>
                                    <Text variant="bodyLarge" style={styles.gridValue}>
                                        {product.fechaVenta}
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        <View style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Compass size={20} color={theme.colors.primary} />
                            <View style={styles.gridTextContainer}>
                                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>ESTADO</Text>
                                <Text variant="bodyLarge" style={[styles.gridValue, { textTransform: 'capitalize' }]}>
                                    {product.estado || 'activo'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Custom/Metadata Fields (Dynamic Excel Columns) */}
                    {hasCustomFields && (
                        <>
                            <Divider style={styles.divider} />
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Campos Adicionales (Excel)
                            </Text>
                            <View style={styles.customFieldsContainer}>
                                {Object.entries(product.customFields!).map(([key, value]) => (
                                    <View key={key} style={[styles.customFieldRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                                        <View style={styles.customFieldHeader}>
                                            <Clipboard size={16} color={theme.colors.outline} style={{ marginRight: 6 }} />
                                            <Text variant="bodyMedium" style={styles.customFieldKey}>
                                                {key}
                                            </Text>
                                        </View>
                                        <Text variant="bodyLarge" style={[styles.customFieldValue, { color: theme.colors.onSurface }]}>
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <Divider style={styles.divider} />

                    {/* Meta Timestamps */}
                    <View style={styles.metaContainer}>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                            Creado: {new Date(product.createdAt).toLocaleDateString()}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                            Actualizado: {new Date(product.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <Button
                            mode="outlined"
                            onPress={handleDeletePress}
                            textColor={theme.colors.error}
                            style={[styles.actionButton, { borderColor: theme.colors.error }]}
                            icon={({ size, color }) => <Trash2 size={size} color={color} />}
                        >
                            Eliminar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleEditPress}
                            style={styles.actionButton}
                            icon={({ size, color }) => <Edit2 size={size} color={color} />}
                        >
                            Editar
                        </Button>
                    </View>

                    <Button onPress={onDismiss} style={styles.closeButton} mode="text">
                        Cerrar
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: '85%',
    },
    scrollContent: {
        paddingVertical: 10,
    },
    header: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerIcon: {
        marginRight: 12,
    },
    titleTextContainer: {
        flex: 1,
    },
    nameText: {
        fontWeight: 'bold',
        lineHeight: 28,
    },
    brandText: {
        marginTop: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    categoryChip: {
        height: 32,
    },
    divider: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        flex: 1,
        minWidth: '45%',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    gridValue: {
        fontWeight: 'bold',
        marginTop: 2,
    },
    customFieldsContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    customFieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    customFieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    customFieldKey: {
        fontWeight: 'bold',
    },
    customFieldValue: {
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    actionButton: {
        flex: 1,
    },
    closeButton: {
        alignSelf: 'center',
        marginTop: 8,
    },
});
