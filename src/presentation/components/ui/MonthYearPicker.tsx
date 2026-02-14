import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, useTheme } from 'react-native-paper';

interface MonthYearPickerProps {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (date: string) => void;
    currentValue?: string; // "MM/YY"
}

export default function MonthYearPicker({ visible, onDismiss, onSelect, currentValue }: MonthYearPickerProps) {
    const theme = useTheme();
    // Range: 2020 to 2050
    const startYear = 20; // 2020
    const endYear = 50;   // 2050
    // Generate years from 20 to 50
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

    const [selectedYear, setSelectedYear] = useState<string>(currentValue ? currentValue.split('/')[1] : String(new Date().getFullYear() % 100));

    const handleMonthSelect = (month: string) => {
        onSelect(`${month}/${selectedYear}`);
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: 'center' }}>Selecciona Fecha de Caducidad</Text>

                <View style={styles.yearContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {years.map(year => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearButton,
                                    selectedYear === String(year) && { backgroundColor: theme.colors.primaryContainer }
                                ]}
                                onPress={() => setSelectedYear(String(year))}
                            >
                                <Text
                                    style={[
                                        styles.yearText,
                                        selectedYear === String(year) && { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }
                                    ]}
                                >
                                    20{year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.monthsGrid}>
                    {months.map(month => {
                        return (
                            <TouchableOpacity
                                key={month}
                                style={[
                                    styles.monthButton,
                                    { borderColor: theme.colors.outlineVariant },
                                ]}
                                onPress={() => handleMonthSelect(month)}
                            >
                                <Text variant="bodyLarge">{month}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Button onPress={onDismiss} style={{ marginTop: 16 }}>Cancelar</Button>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
    },
    yearContainer: {
        marginBottom: 20,
        height: 50,
    },
    yearButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
    },
    yearText: {
        fontSize: 16,
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthButton: {
        width: '30%', // 3 columns
        aspectRatio: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
    }
});
