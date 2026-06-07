import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Card, Checkbox, RadioButton, Divider, Menu, IconButton, TextInput } from 'react-native-paper';
import { UploadCloud, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, FileSpreadsheet, Eye, HelpCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { useProductStore } from '../../store/useProductStore';
import { ProductImportInput, DuplicateStrategy } from '../../../domain/usecases/ImportProducts';

interface ImportWizardModalProps {
    visible: boolean;
    onDismiss: () => void;
}

// System fields available for mapping
interface MappingConfig {
    producto: string;
    stockActual: string;
    cantidadInicial: string;
    cantidadVendida: string;
    fechaVenta: string;
    estado: string;
    unidadMedida: string;
    marca: string;
    linea: string;
    boxName: string;
    fechaCaducidad: string;
}

const SYSTEM_FIELDS: { key: keyof MappingConfig; label: string; required: boolean }[] = [
    { key: 'producto', label: 'Producto (Nombre)', required: true },
    { key: 'stockActual', label: 'Stock Actual (Disponibles)', required: true },
    { key: 'cantidadInicial', label: 'Cantidad Inicial (Recibidos)', required: false },
    { key: 'cantidadVendida', label: 'Cantidad Vendida', required: false },
    { key: 'fechaVenta', label: 'Fecha de Venta', required: false },
    { key: 'estado', label: 'Estado (ej. Disponible)', required: false },
    { key: 'unidadMedida', label: 'Unidad de Medida (ej. 300ml)', required: false },
    { key: 'marca', label: 'Marca (ej. Natura)', required: false },
    { key: 'linea', label: 'Línea (ej. Ekos)', required: false },
    { key: 'boxName', label: 'Caja / Ubicación', required: false },
    { key: 'fechaCaducidad', label: 'Fecha de Caducidad', required: false },
];

export default function ImportWizardModal({ visible, onDismiss }: ImportWizardModalProps) {
    const theme = useTheme();
    const importProducts = useProductStore((state) => state.importProducts);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
    const [pastedText, setPastedText] = useState('');
    
    // File state
    const [fileName, setFileName] = useState<string>('');
    const [sheetData, setSheetData] = useState<any[][]>([]); // Rows including headers
    const [headers, setHeaders] = useState<string[]>([]);
    
    // Mappings: SystemFieldKey -> SpreadsheetHeaderName
    const [mappings, setMappings] = useState<MappingConfig>({
        producto: '',
        stockActual: '',
        cantidadInicial: '',
        cantidadVendida: '',
        fechaVenta: '',
        estado: '',
        unidadMedida: '',
        marca: '',
        linea: '',
        boxName: '',
        fechaCaducidad: '',
    });

    // Custom fields (unmapped headers) selected to import
    const [customFieldsSelected, setCustomFieldsSelected] = useState<Record<string, boolean>>({});
    
    // Duplicate Strategy
    const [strategy, setStrategy] = useState<DuplicateStrategy>('sum');

    // Import stats result
    const [importResult, setImportResult] = useState<{ inserted: number; updated: number; ignored: number } | null>(null);

    // Reset wizard state on opening
    useEffect(() => {
        if (visible) {
            setStep(1);
            setImportMode('file');
            setPastedText('');
            setFileName('');
            setSheetData([]);
            setHeaders([]);
            setMappings({
                producto: '',
                stockActual: '',
                cantidadInicial: '',
                cantidadVendida: '',
                fechaVenta: '',
                estado: '',
                unidadMedida: '',
                marca: '',
                linea: '',
                boxName: '',
                fechaCaducidad: '',
            });
            setCustomFieldsSelected({});
            setStrategy('sum');
            setImportResult(null);
        }
    }, [visible]);

    // Intelligent auto-mapping based on keywords
    const runAutoMapping = (availableHeaders: string[]) => {
        const keywords: Record<keyof MappingConfig, string[]> = {
            producto: ['nombre', 'name', 'producto', 'product', 'desc', 'art', 'articulo', 'título', 'title', 'item'],
            stockActual: ['stock actual', 'stock_actual', 'cantidad actual', 'stock', 'unidades', 'units', 'numero', 'count', 'q', 'cant'],
            cantidadInicial: ['inicial', 'recibida', 'initial', 'base', 'cant. inicial', 'cantidad inicial'],
            cantidadVendida: ['vendida', 'vendido', 'ventas', 'sold', 'sales', 'cant. vendida', 'cantidad vendida'],
            fechaVenta: ['fecha de venta', 'fecha_venta', 'sale date', 'sale_date', 'fecha venta'],
            estado: ['estado', 'status', 'disponibilidad', 'disponible'],
            unidadMedida: ['unidad medida', 'unidad de medida', 'medida', 'volumen', 'peso', 'unit', 'measure', 'size', 'ml', 'g'],
            marca: ['marca', 'brand', 'fabricante', 'proveedor'],
            linea: ['linea', 'línea', 'cat', 'categoria', 'category', 'grupo', 'tipo', 'clasificacion'],
            boxName: ['caja', 'box', 'ubicacion', 'location', 'estante', 'almacen', 'bodega'],
            fechaCaducidad: ['venc', 'caducidad', 'exp', 'expiration', 'fecha', 'date', 'validez', 'vence'],
        };

        const newMappings = { ...mappings };
        let pool = [...availableHeaders];

        // Specific order to match specific headers first and remove them from the pool
        const matchOrder: (keyof MappingConfig)[] = [
            'cantidadInicial',
            'cantidadVendida',
            'fechaVenta',
            'fechaCaducidad',
            'unidadMedida',
            'marca',
            'linea',
            'boxName',
            'estado',
            'producto',
            'stockActual',
        ];

        matchOrder.forEach((key) => {
            const words = keywords[key];
            const matchedHeader = pool.find((h) => {
                const norm = h.toLowerCase();
                return words.some((word) => norm.includes(word));
            });
            if (matchedHeader) {
                newMappings[key] = matchedHeader;
                // Remove from pool to prevent other fields from matching it
                pool = pool.filter((h) => h !== matchedHeader);
            }
        });

        setMappings(newMappings);
    };

    const handlePickFile = async () => {
        setIsLoading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                    'application/vnd.ms-excel', // .xls
                    'text/comma-separated-values',
                    'text/csv',
                ],
            });

            if (result.canceled) {
                setIsLoading(false);
                return;
            }

            const asset = result.assets[0];
            setFileName(asset.name);

            // Read base64 representation of the selected file
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: 'base64',
            });

            const isCsv = asset.name.toLowerCase().endsWith('.csv') || (asset.mimeType && asset.mimeType.toLowerCase().includes('csv'));
            let workbook;
            if (isCsv) {
                const bytes = base64ToUint8Array(base64);
                const isUtf8 = isValidUTF8(bytes);
                const decodedString = isUtf8 ? decodeUTF8(bytes) : decodeWindows1252(bytes);
                workbook = XLSX.read(decodedString, { type: 'string' });
            } else {
                workbook = XLSX.read(base64, { type: 'base64' });
            }
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // rawRows contains array of arrays (rows)
            const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

            if (!rawRows || rawRows.length === 0) {
                Alert.alert('Error', 'La hoja de cálculo está vacía');
                setIsLoading(false);
                return;
            }

            // Filter empty lines
            const filteredRows = rawRows.filter((row) => row && row.length > 0);

            if (filteredRows.length <= 1) {
                Alert.alert('Error', 'El archivo debe tener al menos una cabecera y una fila de datos.');
                setIsLoading(false);
                return;
            }

            // Get headers from first row
            const rawHeaders = filteredRows[0].map((h) => String(h || '').trim());
            
            // Clean duplicates or empty headers
            const cleanHeaders = rawHeaders.map((h, i) => h || `Columna_${i + 1}`);

            setHeaders(cleanHeaders);
            setSheetData(filteredRows);
            
            // Perform auto mapping to help the user
            runAutoMapping(cleanHeaders);

            setIsLoading(false);
            setStep(2); // Go to Mapping step
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Hubo un error al abrir o parsear el archivo.');
            setIsLoading(false);
        }
    };

    const handleParsePastedText = () => {
        if (!pastedText.trim()) {
            Alert.alert('Error', 'Por favor pega los datos de tu tabla.');
            return;
        }

        setIsLoading(true);
        try {
            // Split by lines
            const lines = pastedText.split(/\r?\n/);
            const rawRows = lines
                .map((line) => line.split('\t').map((cell) => cell.trim()))
                .filter((row) => row.length > 0 && row.some((cell) => cell !== ''));

            if (rawRows.length <= 1) {
                Alert.alert('Error', 'Los datos pegados deben tener al menos una cabecera y una fila de datos.');
                setIsLoading(false);
                return;
            }

            setFileName('Datos Copiados de Sheets');
            
            // Get headers from first row
            const rawHeaders = rawRows[0].map((h) => String(h || '').trim());
            const cleanHeaders = rawHeaders.map((h, i) => h || `Columna_${i + 1}`);

            setHeaders(cleanHeaders);
            setSheetData(rawRows);
            
            // Perform auto mapping
            runAutoMapping(cleanHeaders);

            setIsLoading(false);
            setStep(2); // Go to Mapping step
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Hubo un error al procesar los datos pegados.');
            setIsLoading(false);
        }
    };

    // Safe helper to parse dates from Excel
    const parseExcelDate = (val: any): string | null => {
        if (!val) return null;
        if (typeof val === 'number') {
            try {
                // Convert Excel serial date
                const date = new Date((val - 25569) * 86400 * 1000);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            } catch (_) {}
        }
        
        const str = String(val).trim();
        if (!str) return null;

        // Check if YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return str;
        }

        // Parse date separated by slashes or hyphens
        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
            let day = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10);
            let year = parseInt(parts[2], 10);

            if (parts[0].length === 4) {
                // YYYY-MM-DD
                year = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10);
                day = parseInt(parts[2], 10);
            }

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                if (year < 100) year += 2000;
                try {
                    const d = new Date(year, month - 1, day);
                    if (!isNaN(d.getTime())) {
                        return d.toISOString().split('T')[0];
                    }
                } catch (_) {}
            }
        }

        // Parse MM/YY
        if (parts.length === 2) {
            const month = parseInt(parts[0], 10);
            let year = parseInt(parts[1], 10);
            if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
                if (year < 100) year += 2000;
                const lastDay = new Date(year, month, 0).getDate();
                const monthStr = month.toString().padStart(2, '0');
                return `${year}-${monthStr}-${lastDay}`;
            }
        }

        return null;
    };

    // Parse the sheetData into domain inputs
    const prepareImportPayload = (): ProductImportInput[] => {
        const payload: ProductImportInput[] = [];
        const headerRow = headers;

        // Find column indices
        const productoIdx = headerRow.indexOf(mappings.producto);
        const stockActualIdx = headerRow.indexOf(mappings.stockActual);
        const cantidadInicialIdx = headerRow.indexOf(mappings.cantidadInicial);
        const cantidadVendidaIdx = headerRow.indexOf(mappings.cantidadVendida);
        const fechaVentaIdx = headerRow.indexOf(mappings.fechaVenta);
        const estadoIdx = headerRow.indexOf(mappings.estado);
        const unidadMedidaIdx = headerRow.indexOf(mappings.unidadMedida);
        const marcaIdx = headerRow.indexOf(mappings.marca);
        const lineaIdx = headerRow.indexOf(mappings.linea);
        const boxIdx = headerRow.indexOf(mappings.boxName);
        const fechaCaducidadIdx = headerRow.indexOf(mappings.fechaCaducidad);

        // Get active custom fields
        const activeCustomFields = Object.entries(customFieldsSelected)
            .filter(([_, checked]) => checked)
            .map(([header]) => ({ header, idx: headerRow.indexOf(header) }));

        // Loop rows (skipping header)
        for (let r = 1; r < sheetData.length; r++) {
            const row = sheetData[r];
            if (!row || row.length === 0) continue;

            const producto = productoIdx !== -1 ? String(row[productoIdx] || '').trim() : '';
            // Skip rows with no product name
            if (!producto) continue;

            let stockActual = 1;
            if (stockActualIdx !== -1 && row[stockActualIdx] !== undefined) {
                const parsedQty = parseInt(row[stockActualIdx], 10);
                if (!isNaN(parsedQty)) {
                    stockActual = parsedQty;
                }
            }

            let cantidadInicial = null;
            if (cantidadInicialIdx !== -1 && row[cantidadInicialIdx] !== undefined) {
                const parsedVal = parseInt(row[cantidadInicialIdx], 10);
                if (!isNaN(parsedVal)) {
                    cantidadInicial = parsedVal;
                }
            }

            let cantidadVendida = null;
            if (cantidadVendidaIdx !== -1 && row[cantidadVendidaIdx] !== undefined) {
                const parsedVal = parseInt(row[cantidadVendidaIdx], 10);
                if (!isNaN(parsedVal)) {
                    cantidadVendida = parsedVal;
                }
            }

            const fechaVenta = fechaVentaIdx !== -1 && row[fechaVentaIdx] !== undefined ? String(row[fechaVentaIdx]).trim() : null;
            const estado = estadoIdx !== -1 && row[estadoIdx] !== undefined ? String(row[estadoIdx]).trim() : null;
            const unidadMedida = unidadMedidaIdx !== -1 && row[unidadMedidaIdx] !== undefined ? String(row[unidadMedidaIdx]).trim() : null;
            const marca = marcaIdx !== -1 && row[marcaIdx] !== undefined ? String(row[marcaIdx]).trim() : null;
            const linea = lineaIdx !== -1 && row[lineaIdx] !== undefined ? String(row[lineaIdx]).trim() : null;
            const boxName = boxIdx !== -1 && row[boxIdx] !== undefined ? String(row[boxIdx]).trim() : null;
            
            // Handle date parsing
            const rawDateVal = fechaCaducidadIdx !== -1 ? row[fechaCaducidadIdx] : null;
            const fechaCaducidad = parseExcelDate(rawDateVal);

            // Populate custom fields
            const customFields: Record<string, any> = {};
            activeCustomFields.forEach(({ header, idx }) => {
                if (idx !== -1 && row[idx] !== undefined && row[idx] !== null && String(row[idx]).trim() !== '') {
                    customFields[header] = row[idx];
                }
            });

            payload.push({
                producto,
                stockActual,
                marca,
                linea,
                boxName,
                fechaCaducidad,
                customFields: Object.keys(customFields).length > 0 ? customFields : null,
                unidadMedida: unidadMedida || 'units',
                estado: estado || 'active',
                image: null,
                cantidadInicial,
                cantidadVendida,
                fechaVenta,
            });
        }

        return payload;
    };

    const handleConfirmImport = async () => {
        setIsLoading(true);
        try {
            const payload = prepareImportPayload();
            if (payload.length === 0) {
                Alert.alert('Error', 'No hay datos válidos para importar. Revisa las columnas requeridas.');
                setIsLoading(false);
                return;
            }

            const result = await importProducts(payload, strategy);
            setImportResult(result);
            setStep(5); // Go to finished screen
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Hubo un error al procesar la importación.');
        } finally {
            setIsLoading(false);
        }
    };

    // Sub-component for dropdown options
    const MappingSelector = ({ fieldKey, label, required }: { fieldKey: keyof MappingConfig; label: string; required: boolean }) => {
        const [menuVisible, setMenuVisible] = useState(false);

        const currentValue = mappings[fieldKey];

        return (
            <View style={styles.mappingRow}>
                <View style={styles.mappingMeta}>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                        {label} {required && <Text style={{ color: theme.colors.error }}>*</Text>}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        {required ? 'Columna obligatoria' : 'Columna opcional'}
                    </Text>
                </View>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            style={styles.mappingButton}
                            labelStyle={styles.mappingButtonLabel}
                            contentStyle={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                            icon="chevron-down"
                        >
                            {currentValue || 'Ignorar Columna'}
                        </Button>
                    }
                >
                    {!required && (
                        <Menu.Item
                            onPress={() => {
                                setMappings({ ...mappings, [fieldKey]: '' });
                                setMenuVisible(false);
                            }}
                            title="Ignorar Columna"
                            titleStyle={{ color: theme.colors.outline }}
                        />
                    )}
                    {headers.map((h) => (
                        <Menu.Item
                            key={h}
                            onPress={() => {
                                setMappings({ ...mappings, [fieldKey]: h });
                                setMenuVisible(false);
                            }}
                            title={h}
                        />
                    ))}
                </Menu>
            </View>
        );
    };

    // Unmapped headers list for step 3
    const getUnmappedHeaders = (): string[] => {
        const mappedValues = Object.values(mappings);
        return headers.filter((h) => !mappedValues.includes(h));
    };

    const handleCustomFieldToggle = (header: string) => {
        setCustomFieldsSelected({
            ...customFieldsSelected,
            [header]: !customFieldsSelected[header],
        });
    };

    const isStep2Valid = (): boolean => {
        return !!mappings.producto && !!mappings.stockActual;
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={isLoading ? undefined : onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                {/* Header Step Indicator */}
                <View style={styles.wizardHeader}>
                    <Text variant="headlineSmall" style={styles.wizardTitle}>
                        Importar Excel / CSV
                    </Text>
                    {step < 5 && (
                        <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            Paso {step} de 4
                        </Text>
                    )}
                </View>
                
                <Divider style={{ marginBottom: 16 }} />

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* STEP 1: SELECT IMPORT METHOD */}
                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.tabContainer}>
                                <Button 
                                    mode={importMode === 'file' ? 'contained' : 'outlined'} 
                                    onPress={() => setImportMode('file')}
                                    style={styles.tabButton}
                                    labelStyle={{ fontSize: 12 }}
                                >
                                    Archivo Excel/CSV
                                </Button>
                                <Button 
                                    mode={importMode === 'paste' ? 'contained' : 'outlined'} 
                                    onPress={() => setImportMode('paste')}
                                    style={styles.tabButton}
                                    labelStyle={{ fontSize: 12 }}
                                >
                                    Pegar Tabla
                                </Button>
                            </View>

                            {importMode === 'file' ? (
                                <View>
                                    <UploadCloud size={64} color={theme.colors.primary} style={styles.stepIcon} />
                                    <Text variant="bodyLarge" style={styles.stepInstructions}>
                                        Selecciona un archivo de hoja de cálculo (.xlsx, .xls o .csv) para importar tus productos.
                                    </Text>
                                    
                                    <Button
                                        mode="contained"
                                        onPress={handlePickFile}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        style={styles.actionButton}
                                        contentStyle={{ paddingVertical: 8 }}
                                    >
                                        Seleccionar Archivo
                                    </Button>
                                </View>
                            ) : (
                                <View style={{ paddingHorizontal: 8 }}>
                                    <Text variant="bodyMedium" style={[styles.stepInstructions, { textAlign: 'left', marginBottom: 12 }]}>
                                        Copia las filas directamente de tu Google Sheets (incluyendo la fila de cabeceras) y pégalas aquí abajo.
                                    </Text>
                                    
                                    <TextInput
                                        mode="outlined"
                                        label="Pegar datos de la tabla"
                                        placeholder="Marca	Línea	Producto	..."
                                        multiline
                                        numberOfLines={10}
                                        value={pastedText}
                                        onChangeText={setPastedText}
                                        style={styles.textArea}
                                    />
                                    
                                    <Button
                                        mode="contained"
                                        onPress={handleParsePastedText}
                                        loading={isLoading}
                                        disabled={isLoading || !pastedText.trim()}
                                        style={styles.actionButton}
                                        contentStyle={{ paddingVertical: 8 }}
                                    >
                                        Procesar Datos Pegados
                                    </Button>
                                </View>
                            )}
                        </View>
                    )}

                    {/* STEP 2: COLUMN MAPPING */}
                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <Card style={styles.infoCard}>
                                <Card.Content style={styles.infoCardContent}>
                                    <FileSpreadsheet size={20} color={theme.colors.primary} />
                                    <Text variant="bodyMedium" style={styles.infoCardText}>
                                        Archivo cargado: <Text style={{ fontWeight: 'bold' }}>{fileName}</Text> ({sheetData.length - 1} filas detectadas)
                                    </Text>
                                </Card.Content>
                            </Card>

                            <Text variant="titleMedium" style={styles.stepSubtitle}>
                                Asocia las columnas de tu Excel
                            </Text>
                            <Text variant="bodyMedium" style={styles.stepDesc}>
                                Elige qué columna de tu archivo corresponde a cada campo en la base de datos de Vindex.
                            </Text>

                            <View style={styles.mappingList}>
                                {SYSTEM_FIELDS.map((field) => (
                                    <MappingSelector
                                        key={field.key}
                                        fieldKey={field.key}
                                        label={field.label}
                                        required={field.required}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* STEP 3: CUSTOM / EXTRA FIELDS */}
                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <Text variant="titleMedium" style={styles.stepSubtitle}>
                                Campos adicionales (Adaptar base de datos)
                            </Text>
                            <Text variant="bodyMedium" style={styles.stepDesc}>
                                Detectamos columnas extras en tu hoja de cálculo. Selecciona cuáles deseas conservar. Se guardarán de manera dinámica en el producto.
                            </Text>

                            {getUnmappedHeaders().length === 0 ? (
                                <View style={styles.emptyState}>
                                    <CheckCircle2 size={32} color={theme.colors.outline} />
                                    <Text variant="bodyLarge" style={styles.emptyStateText}>
                                        Todas las columnas han sido mapeadas. No hay columnas adicionales.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.checkboxList}>
                                    {getUnmappedHeaders().map((header) => (
                                        <TouchableOpacity
                                            key={header}
                                            style={[styles.checkboxItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                                            onPress={() => handleCustomFieldToggle(header)}
                                        >
                                            <Checkbox.Android
                                                status={customFieldsSelected[header] ? 'checked' : 'unchecked'}
                                                onPress={() => handleCustomFieldToggle(header)}
                                            />
                                            <Text variant="bodyLarge" style={styles.checkboxLabel}>
                                                {header}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* STEP 4: DUPLICATE RESOLUTION */}
                    {step === 4 && (
                        <View style={styles.stepContainer}>
                            <Text variant="titleMedium" style={styles.stepSubtitle}>
                                Resolución de Duplicados
                            </Text>
                            <Text variant="bodyMedium" style={styles.stepDesc}>
                                Si un producto en tu Excel ya existe en Vindex (coincidencia de Nombre y Marca), ¿qué deseas hacer?
                            </Text>

                            <RadioButton.Group onValueChange={(val) => setStrategy(val as DuplicateStrategy)} value={strategy}>
                                <Card style={styles.radioCard} onPress={() => setStrategy('sum')}>
                                    <Card.Content style={styles.radioCardContent}>
                                        <RadioButton.Android value="sum" />
                                        <View style={styles.radioCardText}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                Sumar cantidades (Recomendado)
                                            </Text>
                                            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                                                Suma el stock del Excel al producto ya registrado en Vindex.
                                            </Text>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.radioCard} onPress={() => setStrategy('overwrite')}>
                                    <Card.Content style={styles.radioCardContent}>
                                        <RadioButton.Android value="overwrite" />
                                        <View style={styles.radioCardText}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                Sobrescribir datos
                                            </Text>
                                            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                                                Reemplaza los campos de Vindex con la información más reciente de tu Excel.
                                            </Text>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.radioCard} onPress={() => setStrategy('ignore')}>
                                    <Card.Content style={styles.radioCardContent}>
                                        <RadioButton.Android value="ignore" />
                                        <View style={styles.radioCardText}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                Ignorar duplicados
                                            </Text>
                                            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                                                Omite el producto del Excel y conserva la información intacta en Vindex.
                                            </Text>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.radioCard} onPress={() => setStrategy('duplicate')}>
                                    <Card.Content style={styles.radioCardContent}>
                                        <RadioButton.Android value="duplicate" />
                                        <View style={styles.radioCardText}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                Crear nuevo registro
                                            </Text>
                                            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                                                Inserta el producto como un nuevo elemento separado, aunque comparta nombre.
                                            </Text>
                                        </View>
                                    </Card.Content>
                                </Card>
                            </RadioButton.Group>
                        </View>
                    )}

                    {/* STEP 5: SUCCESS & SUMMARY */}
                    {step === 5 && importResult && (
                        <View style={styles.stepContainer}>
                            <CheckCircle2 size={64} color={theme.colors.primary} style={styles.stepIcon} />
                            <Text variant="headlineSmall" style={styles.successTitle}>
                                ¡Importación Completada!
                            </Text>
                            
                            <Card style={styles.statsCard}>
                                <Card.Content>
                                    <Text variant="titleMedium" style={styles.statsTitle}>
                                        Resumen del proceso:
                                    </Text>
                                    <Divider style={{ marginVertical: 8 }} />
                                    
                                    <View style={styles.statRow}>
                                        <Text variant="bodyLarge">Productos Nuevos Insertados:</Text>
                                        <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                            {importResult.inserted}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.statRow}>
                                        <Text variant="bodyLarge">Productos Existentes Actualizados:</Text>
                                        <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: '#F57C00' }}>
                                            {importResult.updated}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.statRow}>
                                        <Text variant="bodyLarge">Filas Ignoradas / Omitidas:</Text>
                                        <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                            {importResult.ignored}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>

                            <Button mode="contained" onPress={onDismiss} style={styles.actionButton}>
                                Volver al Inventario
                            </Button>
                        </View>
                    )}
                </ScrollView>

                {/* Footer Navigation Buttons */}
                {step < 5 && (
                    <View style={styles.footer}>
                        {step > 1 ? (
                            <Button
                                mode="outlined"
                                onPress={() => setStep(step - 1)}
                                style={styles.footerButton}
                                disabled={isLoading}
                                icon={() => <ArrowLeft size={16} color={theme.colors.primary} />}
                            >
                                Atrás
                            </Button>
                        ) : (
                            <Button
                                mode="text"
                                onPress={onDismiss}
                                style={styles.footerButton}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        )}

                        {step > 1 && step < 4 && (
                            <Button
                                mode="contained"
                                onPress={() => setStep(step + 1)}
                                style={styles.footerButton}
                                disabled={step === 2 && !isStep2Valid()}
                                contentStyle={{ flexDirection: 'row-reverse' }}
                                icon={() => <ArrowRight size={16} color="white" />}
                            >
                                Siguiente
                            </Button>
                        )}

                        {step === 4 && (
                            <Button
                                mode="contained"
                                onPress={handleConfirmImport}
                                loading={isLoading}
                                disabled={isLoading}
                                style={styles.footerButton}
                                icon={() => <CheckCircle2 size={16} color="white" />}
                            >
                                Confirmar
                            </Button>
                        )}
                    </View>
                )}
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        padding: 20,
        margin: 16,
        borderRadius: 16,
        maxHeight: '90%',
        flex: 1,
    },
    wizardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
    },
    wizardTitle: {
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: 24,
    },
    stepContainer: {
        flex: 1,
    },
    stepIcon: {
        alignSelf: 'center',
        marginVertical: 24,
    },
    stepInstructions: {
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
        lineHeight: 22,
    },
    stepSubtitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    stepDesc: {
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    actionButton: {
        marginTop: 16,
        alignSelf: 'center',
        width: '80%',
    },
    infoCard: {
        marginBottom: 16,
        backgroundColor: '#E8F0FE',
    },
    infoCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoCardText: {
        flex: 1,
    },
    mappingList: {
        gap: 12,
    },
    mappingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    mappingMeta: {
        flex: 1,
        marginRight: 16,
    },
    mappingButton: {
        minWidth: 150,
        maxWidth: 180,
    },
    mappingButtonLabel: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        gap: 12,
    },
    emptyStateText: {
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    checkboxList: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    checkboxLabel: {
        marginLeft: 8,
    },
    radioCard: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    radioCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCardText: {
        marginLeft: 12,
        flex: 1,
    },
    successTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 20,
    },
    statsCard: {
        marginVertical: 16,
        backgroundColor: 'white',
    },
    statsTitle: {
        fontWeight: 'bold',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerButton: {
        minWidth: 100,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    tabButton: {
        flex: 1,
    },
    textArea: {
        backgroundColor: 'white',
        minHeight: 150,
        marginBottom: 16,
    },
});

// Helper functions for CSV encoding auto-detection and decoding
const win1252Mapping: Record<number, number> = {
    0x80: 0x20AC, // €
    0x82: 0x201A, // ‚
    0x83: 0x0192, // ƒ
    0x84: 0x201E, // „
    0x85: 0x2026, // …
    0x86: 0x2020, // †
    0x87: 0x2021, // ‡
    0x88: 0x02C6, // ˆ
    0x89: 0x2030, // ‰
    0x8A: 0x0160, // Š
    0x8B: 0x2039, // ‹
    0x8C: 0x0152, // Œ
    0x8E: 0x017D, // Ž
    0x91: 0x2018, // ‘
    0x92: 0x2019, // ’
    0x93: 0x201C, // “
    0x94: 0x201D, // ”
    0x95: 0x2022, // •
    0x96: 0x2013, // –
    0x97: 0x2014, // —
    0x98: 0x02DC, // ˜
    0x99: 0x2122, // ™
    0x9A: 0x0161, // š
    0x9B: 0x203A, // ›
    0x9C: 0x0153, // œ
    0x9E: 0x017E, // ž
    0x9F: 0x0178, // Ÿ
};

function base64ToUint8Array(base64: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    
    const cleaned = base64.replace(/=+$/, '').replace(/\s/g, '');
    const len = cleaned.length;
    const bytes = new Uint8Array(Math.floor((len * 3) / 4));
    
    let p = 0;
    for (let i = 0; i < len; i += 4) {
        const c1 = lookup[cleaned.charCodeAt(i)];
        const c2 = lookup[cleaned.charCodeAt(i + 1)];
        const c3 = i + 2 < len ? lookup[cleaned.charCodeAt(i + 2)] : 0;
        const c4 = i + 3 < len ? lookup[cleaned.charCodeAt(i + 3)] : 0;
        
        bytes[p++] = (c1 << 2) | (c2 >> 4);
        if (p < bytes.length) {
            bytes[p++] = ((c2 & 15) << 4) | (c3 >> 2);
        }
        if (p < bytes.length) {
            bytes[p++] = ((c3 & 3) << 6) | c4;
        }
    }
    return bytes;
}

function isValidUTF8(bytes: Uint8Array): boolean {
    let i = 0;
    while (i < bytes.length) {
        const byte = bytes[i];
        if (byte <= 0x7F) {
            i++;
        } else if (byte >= 0xC2 && byte <= 0xDF) {
            if (i + 1 >= bytes.length) return false;
            if ((bytes[i + 1] & 0xC0) !== 0x80) return false;
            i += 2;
        } else if (byte >= 0xE0 && byte <= 0xEF) {
            if (i + 2 >= bytes.length) return false;
            if ((bytes[i + 1] & 0xC0) !== 0x80) return false;
            if ((bytes[i + 2] & 0xC0) !== 0x80) return false;
            i += 3;
        } else if (byte >= 0xF0 && byte <= 0xF4) {
            if (i + 3 >= bytes.length) return false;
            if ((bytes[i + 1] & 0xC0) !== 0x80) return false;
            if ((bytes[i + 2] & 0xC0) !== 0x80) return false;
            if ((bytes[i + 3] & 0xC0) !== 0x80) return false;
            i += 4;
        } else {
            return false;
        }
    }
    return true;
}

function decodeUTF8(bytes: Uint8Array): string {
    let out = '';
    let i = 0;
    while (i < bytes.length) {
        const c = bytes[i++];
        if (c < 0x80) {
            out += String.fromCharCode(c);
        } else if (c >= 0xC0 && c < 0xE0) {
            const c2 = bytes[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F));
        } else if (c >= 0xE0 && c < 0xF0) {
            const c2 = bytes[i++];
            const c3 = bytes[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F));
        } else if (c >= 0xF0 && c < 0xF5) {
            const c2 = bytes[i++];
            const c3 = bytes[i++];
            const c4 = bytes[i++];
            const codePoint = ((c & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F);
            out += String.fromCodePoint(codePoint);
        }
    }
    return out;
}

function decodeWindows1252(bytes: Uint8Array): string {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        if (byte >= 0x80 && byte <= 0x9F) {
            const mapped = win1252Mapping[byte];
            out += String.fromCharCode(mapped !== undefined ? mapped : byte);
        } else {
            out += String.fromCharCode(byte);
        }
    }
    return out;
}
