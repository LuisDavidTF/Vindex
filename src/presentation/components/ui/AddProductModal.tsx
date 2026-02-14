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
    const getUniqueBrands = useProductStore((state) => state.getUniqueBrands);
    const getUniqueCategories = useProductStore((state) => state.getUniqueCategories);
    const getUniqueNames = useProductStore((state) => state.getUniqueNames);

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [boxName, setBoxName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Effect to pre-fill form when editing
    useEffect(() => {
        if (visible) {
            if (productToEdit) {
                setName(productToEdit.name);
                setBrand(productToEdit.brand || '');
                setCategory(productToEdit.category || '');
                // Handle box display logic reverse from what we did in card
                // if it has specific boxName joined, use it. 
                // We stored it in state as string, so we just set it.
                setBoxName(productToEdit.boxName || '');
                setQuantity(productToEdit.quantity.toString());

                // Convert YYYY-MM-DD back to MM/YY for display if needed
                if (productToEdit.expirationDate) {
                    const [year, month] = productToEdit.expirationDate.split('-');
                    setExpirationDate(`${month}/${year.slice(2)}`);
                } else {
                    setExpirationDate('');
                }
            } else {
                resetForm();
            }
        }
    }, [visible, productToEdit]);

    // reset form state
    const resetForm = () => {
        setName('');
        setBrand('');
        setCategory('');
        setBoxName('');
        setQuantity('');
        setExpirationDate('');
    };

    const handleDismiss = () => {
        resetForm();
        onDismiss();
    };

    const handleOpenDatePicker = () => {
        Keyboard.dismiss();
        setShowDatePicker(true);
    };

    const handleSubmit = async () => {
        if (!name) return;

        // Convert MM/YY to YYYY-MM-DD
        let isoDate = null;
        if (expirationDate.length === 5) {
            const [month, year] = expirationDate.split('/');
            const fullYear = `20${year}`;
            // Get last day of the month
            const lastDay = new Date(parseInt(fullYear), parseInt(month), 0).getDate();
            isoDate = `${fullYear}-${month}-${lastDay}`;
        }

        if (productToEdit) {
            await editProduct(productToEdit.id, {
                name,
                brand: brand || undefined, // Send undefined if empty to avoid overwriting with empty string if not intended? Or empty string is null?
                // Domain usually treats empty string as value. Let's send what user typed.
                category: category || undefined,
                boxName: boxName, // Logic in store handles this
                quantity: parseInt(quantity) || 0,
                expirationDate: isoDate,
            });
        } else {
            await addProduct({
                name,
                brand,
                category,
                boxName,
                quantity: parseInt(quantity) || 0,
                expirationDate: isoDate,
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
                                value={name}
                                onChangeText={setName}
                                data={getUniqueNames()}
                                style={styles.input}
                            />
                        </View>

                        {/* High zIndex for Brand */}
                        <View style={[styles.inputContainer, { zIndex: 100 }]}>
                            <AutocompleteInput
                                label="Marca (ej. Natura)"
                                value={brand}
                                onChangeText={setBrand}
                                data={getUniqueBrands()}
                                style={styles.input}
                            />
                        </View>

                        {/* Medium zIndex for Category */}
                        <View style={[styles.inputContainer, { zIndex: 90 }]}>
                            <AutocompleteInput
                                label="Categoría (ej. Cremas)"
                                value={category}
                                onChangeText={setCategory}
                                data={getUniqueCategories()}
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
                                label="Cantidad"
                                value={quantity}
                                onChangeText={setQuantity}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TouchableOpacity onPress={handleOpenDatePicker}>
                                <TextInput
                                    label="Fecha de Caducidad (MM/AA)"
                                    value={expirationDate}
                                    mode="outlined"
                                    style={styles.input}
                                    placeholder="Seleccionar Fecha"
                                    editable={false} // Disable typing, force picker
                                    right={<TextInput.Icon icon={() => <Calendar size={24} color={theme.colors.onSurface} />} onPress={handleOpenDatePicker} />}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actions}>
                            <Button onPress={handleDismiss} style={styles.button} mode="outlined">Cancelar</Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={isLoading || !name}
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
                    onSelect={setExpirationDate}
                    currentValue={expirationDate}
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
        flex: 1, // Ensure modal takes space
    },
    inputContainer: {
        marginBottom: 12,
        // Default zIndex is 0. 
        // We override this inline for Autocomplete inputs.
    },
    input: {
        backgroundColor: 'white',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        marginBottom: 20, // Extra space at bottom
    },
    button: {
        marginLeft: 8,
    },
});
