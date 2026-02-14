import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, Surface, useTheme } from 'react-native-paper';

interface AutocompleteInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    data: string[];
    placeholder?: string;
    style?: any;
}

export default function AutocompleteInput({ label, value, onChangeText, data, placeholder, style }: AutocompleteInputProps) {
    const theme = useTheme();
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Sort: startsWith matches first, then broader includes
    const filteredData = data
        .filter(item => item.toLowerCase().includes(value.toLowerCase()) && item !== value)
        .sort((a, b) => {
            const aStarts = a.toLowerCase().startsWith(value.toLowerCase());
            const bStarts = b.toLowerCase().startsWith(value.toLowerCase());
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.localeCompare(b);
        });

    const handleSelect = (item: string) => {
        onChangeText(item);
        setShowSuggestions(false);
    };

    return (
        <View style={[styles.container, style]}>
            <TextInput
                label={label}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                    // Delay to allow tap on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
                mode="outlined"
                placeholder={placeholder}
            />
            {showSuggestions && value.length > 0 && filteredData.length > 0 && (
                <Surface style={styles.suggestionsList} elevation={2}>
                    {filteredData.slice(0, 3).map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelect(item)}
                            style={[
                                styles.suggestionItem,
                                { borderBottomWidth: index === filteredData.length - 1 ? 0 : 1, borderBottomColor: theme.colors.outlineVariant }
                            ]}
                        >
                            <Text>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </Surface>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        // zIndex is handled by parent for stacking context usually, 
        // but local zIndex 1 ensures input text is above its background? 
        // actually main stacking context is parent.
    },
    suggestionsList: {
        position: 'absolute',
        top: '100%', // right below input
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 4,
        zIndex: 9999, // Try high zIndex
        elevation: 5, // Android shadow/elevation
        marginTop: 2,
    },
    suggestionItem: {
        padding: 12,
        zIndex: 10000,
    },
});
