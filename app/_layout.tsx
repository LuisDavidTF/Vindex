import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../src/data/local/database';
import migrations from '../drizzle/migrations';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
    const { success, error } = useMigrations(db, migrations);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="red" />
            </View>
        );
    }

    if (!success) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <PaperProvider>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Vindex' }} />
            </Stack>
        </PaperProvider>
    );
}
