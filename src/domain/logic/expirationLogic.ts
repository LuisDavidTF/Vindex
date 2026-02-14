export type ExpirationStatus = 'good' | 'warning' | 'critical' | 'expired';

export const parseMexicanDate = (input: string): string | null => {
    // Expected format: MM/YY or MM/YYYY
    // Returns: YYYY-MM-DD (Last day of the month)

    const cleanInput = input.replace(/[^0-9/]/g, '');
    const parts = cleanInput.split('/');

    if (parts.length !== 2) return null;

    let month = parseInt(parts[0], 10);
    let year = parseInt(parts[1], 10);

    if (isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12) return null;

    // Handle 2-digit year
    if (year < 100) {
        year += 2000;
    }

    // Get last day of the month
    const lastDay = new Date(year, month, 0).getDate();

    // Format YYYY-MM-DD
    const monthStr = month.toString().padStart(2, '0');
    return `${year}-${monthStr}-${lastDay}`;
};

export const formatMexicanDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${month}/${year}`;
};

export const calculateExpirationStatus = (expirationDate: string | null): ExpirationStatus => {
    if (!expirationDate) return 'good';

    const now = new Date();
    // Reset time to start of day for comparison
    now.setHours(0, 0, 0, 0);

    const exp = new Date(expirationDate);
    // Use end of day for expiration to be generous? Or start? 
    // Usually expiration is until the end of that day.
    exp.setHours(23, 59, 59, 999);

    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'expired';
    if (diffDays <= 7) return 'critical';
    if (diffDays <= 90) return 'warning'; // Approx 3 months

    return 'good';
};

export const getStatusColor = (status: ExpirationStatus, theme: any): string => {
    switch (status) {
        case 'expired': return theme.colors.error; // Red-ish/Gray
        case 'critical': return theme.colors.error; // Red
        case 'warning': return '#F57C00'; // Orange/Amber
        case 'good': return theme.colors.primary; // Green-ish (or primary)
        default: return theme.colors.onSurface;
    }
};

export const getStatusLabel = (status: ExpirationStatus): string => {
    switch (status) {
        case 'expired': return 'Vencido';
        case 'critical': return 'Vence pronto';
        case 'warning': return 'Por vencer';
        case 'good': return 'Vigente';
        default: return 'Desconocido';
    }
};
