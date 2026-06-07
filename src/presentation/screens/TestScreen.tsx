import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { db } from '../../data/local/database';
import { products } from '../../data/local/schema';
import { Product } from '../../domain/entities/Product';
import { desc } from 'drizzle-orm';

export default function TestScreen() {
    const [data, setData] = useState<Product[]>([]);

    const loadData = async () => {
        try {
            const result = await db.select().from(products).orderBy(desc(products.id));
            // casting because of date strings vs simplified entity
            setData(result as unknown as Product[]);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const addDummyProduct = async () => {
        try {
            await db.insert(products).values({
                producto: 'Crema Natura ' + Math.floor(Math.random() * 1000),
                stockActual: 1,
                fechaCaducidad: new Date().toISOString(),
            });
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Button mode="contained" onPress={addDummyProduct} style={{ marginBottom: 20 }}>
                Add Dummy Product
            </Button>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Title title={item.producto} subtitle={`Qty: ${item.stockActual}`} />
                    </Card>
                )}
            />
        </View>
    );
}
