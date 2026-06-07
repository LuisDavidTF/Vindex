import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useProductStore } from '../../store/useProductStore';
import AutocompleteInput from './AutocompleteInput';
import MonthYearPicker from './MonthYearPicker';
import { Calendar } from 'lucide-react-native';
import { Product } from '../../../domain/entities/Product';

interface AddProductModalProps {
    visible: boolean;
    onDismiss: () => void;
    productToEdit?: Product | null;
}

export default function AddProductModal({ visible, onDismiss, productToEdit }: AddProductModalProps) {
    const theme = useTheme();
    const addProduct = useProductStore((state) => state.addProduct);
    const editProduct = useProductStore((state) => state.editProduct);
    const isLoading = useProductStore((state) => state.isLoading);
    const getUniqueMarcas = useProductStore((state) => state.getUniqueMarcas);
    const getUniqueLineas = useProductStore((state) => state.getUniqueLineas);
    const getUniqueProductos = useProductStore((state) => state.getUniqueProductos);

    const [producto, setProducto] = useState('');
    const [marca, setMarca] = useState('');
    const [linea, setLinea] = useState('');
    const [boxName, setBoxName] = useState('');
    const [stockActual, setStockActual] = useState('');
    const [fechaCaducidad, setFechaCaducidad] = useState('');
    const [cantidadInicial, setCantidadInicial] = useState('');
    const [cantidadVendida, setCantidadVendida] = useState('');
    const [fechaVenta, setFechaVenta] = useState('');
    const [estado, setEstado] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Effect to pre-fill form when editing
    useEffect(() => {
        if (visible) {
            if (productToEdit) {
                setProducto(productToEdit.producto);
                setMarca(productToEdit.marca || '');
                setLinea(productToEdit.linea || '');
                setBoxName(productToEdit.boxName || '');
                setStockActual(productToEdit.stockActual.toString());
                setCantidadInicial(productToEdit.cantidadInicial?.toString() || '');
                setCantidadVendida(productToEdit.cantidadVendida?.toString() || '');
                setFechaVenta(productToEdit.fechaVenta || '');
                setEstado(productToEdit.estado || '');
                setUnidadMedida(productToEdit.unidadMedida || '');

                // Convert YYYY-MM-DD back to MM/YY for display if needed
                if (productToEdit.fechaCaducidad) {
                    const [year, month] = productToEdit.fechaCaducidad.split('-');
                    setFechaCaducidad(`${month}/${year.slice(2)}`);
                } else {
                    setFechaCaducidad('');
                }
            } else {
                resetForm();
            }
        }
    }, [visible, productToEdit]);

    // reset form state
    const resetForm = () => {
        setProducto('');
        setMarca('');
        setLinea('');
        setBoxName('');
        setStockActual('');
        setFechaCaducidad('');
        setCantidadInicial('');
        setCantidadVendida('');
        setFechaVenta('');
        setEstado('');
        setUnidadMedida('');
    };

    const handleDismiss = () => {
        resetForm();
        onDismiss();
    };

    const handleOpenDatePicker = () => {
        Keyboard.dismiss();
        setShowDatePicker(true);
    };

    const handleInitialQtyChange = (val: string) => {
        setCantidadInicial(val);
        const init = parseInt(val, 10) || 0;
        const sold = parseInt(cantidadVendida, 10) || 0;
        setStockActual(Math.max(0, init - sold).toString());
    };

    const handleSoldQtyChange = (val: string) => {
        setCantidadVendida(val);
        const init = parseInt(cantidadInicial, 10) || 0;
        const sold = parseInt(val, 10) || 0;
        setStockActual(Math.max(0, init - sold).toString());
    };

    const handleSubmit = async () => {
        if (!producto) return;

        // Convert MM/YY to YYYY-MM-DD
        let isoDate = null;
        if (fechaCaducidad.length === 5) {
            const [month, year] = fechaCaducidad.split('/');
            const fullYear = `20${year}`;
            // Get last day of the month
            const lastDay = new Date(parseInt(fullYear), parseInt(month), 0).getDate();
            isoDate = `${fullYear}-${month}-${lastDay}`;
        }

        const initQty = parseInt(cantidadInicial);
        const sldQty = parseInt(cantidadVendida);

        if (productToEdit) {
            await editProduct(productToEdit.id, {
                producto,
                marca: marca || undefined,
                linea: linea || undefined,
                boxName: boxName,
                stockActual: parseInt(stockActual) || 0,
                fechaCaducidad: isoDate,
                cantidadInicial: isNaN(initQty) ? undefined : initQty,
                cantidadVendida: isNaN(sldQty) ? undefined : sldQty,
                fechaVenta: fechaVenta || null,
                estado: estado || null,
                unidadMedida: unidadMedida || null,
            });
        } else {
            await addProduct({
                producto,
                marca,
                linea,
                boxName,
                stockActual: parseInt(stockActual) || 0,
                fechaCaducidad: isoDate,
                cantidadInicial: isNaN(initQty) ? undefined : initQty,
                cantidadVendida: isNaN(sldQty) ? undefined : sldQty,
                fechaVenta: fechaVenta || null,
                estado: estado || null,
                unidadMedida: unidadMedida || null,
            });
        }

        handleDismiss();
    };

    const isEditing = !!productToEdit;

    return (
        <Portal>
            <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
                            {isEditing ? 'Editar Producto' : 'Agregar Producto'}
                        </Text>

                        <View style={[styles.inputContainer, { zIndex: 110 }]}>
                            <AutocompleteInput
                                label="Nombre del Producto"
                                value={producto}
                                onChangeText={setProducto}
                                data={getUniqueProductos()}
                                style={styles.input}
                            />
                        </View>

                        {/* High zIndex for Marca */}
                        <View style={[styles.inputContainer, { zIndex: 100 }]}>
                            <AutocompleteInput
                                label="Marca (ej. Natura)"
                                value={marca}
                                onChangeText={setMarca}
                                data={getUniqueMarcas()}
                                style={styles.input}
                            />
                        </View>

                        {/* Medium zIndex for Línea */}
                        <View style={[styles.inputContainer, { zIndex: 90 }]}>
                            <AutocompleteInput
                                label="Línea (ej. Ekos)"
                                value={linea}
                                onChangeText={setLinea}
                                data={getUniqueLineas()}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Caja / Ubicación (ej. Caja 1)"
                                value={boxName}
                                onChangeText={setBoxName}
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Cantidad Inicial (Recibida)"
                                value={cantidadInicial}
                                onChangeText={handleInitialQtyChange}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Cantidad Vendida"
                                value={cantidadVendida}
                                onChangeText={handleSoldQtyChange}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Stock Actual (Auto-calculado)"
                                value={stockActual}
                                onChangeText={setStockActual}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Unidad de Medida (ej. 300ml, 200g)"
                                value={unidadMedida}
                                onChangeText={setUnidadMedida}
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TouchableOpacity onPress={handleOpenDatePicker}>
                                <TextInput
                                    label="Fecha de Caducidad (MM/AA)"
                                    value={fechaCaducidad}
                                    mode="outlined"
                                    style={styles.input}
                                    placeholder="Seleccionar Fecha"
                                    editable={false}
                                    right={<TextInput.Icon icon={() => <Calendar size={24} color={theme.colors.onSurface} />} onPress={handleOpenDatePicker} />}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Fecha de Venta"
                                value={fechaVenta}
                                onChangeText={setFechaVenta}
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Estado (ej. Disponible, Agotado)"
                                value={estado}
                                onChangeText={setEstado}
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.actions}>
                            <Button onPress={handleDismiss} style={styles.button} mode="outlined">Cancelar</Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={isLoading || !producto}
                                style={styles.button}
                            >
                                {isEditing ? 'Guardar Cambios' : 'Guardar'}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <MonthYearPicker
                    visible={showDatePicker}
                    onDismiss={() => setShowDatePicker(false)}
                    onSelect={setFechaCaducidad}
                    currentValue={fechaCaducidad}
                />
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
        flex: 1,
    },
    inputContainer: {
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'white',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        marginBottom: 20,
    },
    button: {
        marginLeft: 8,
    },
});
