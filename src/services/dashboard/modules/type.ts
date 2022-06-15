import { TranslateResult } from 'vue-i18n';

export interface DashboardWidgetProps {
    extraParams?: Record<string, any>;
}

// AllSummary
export type DateType = 'DAILY' | 'MONTHLY';
export interface DateItem {
    name: DateType;
    label: TranslateResult;
}
export const DATA_TYPE = {
    SERVER: 'SERVER',
    DATABASE: 'DATABASE',
    STORAGE: 'STORAGE',
    BILLING: 'BILLING',
} as const;
export type DataType = typeof DATA_TYPE[keyof typeof DATA_TYPE]
export enum CLOUD_SERVICE_LABEL {
    SERVER = 'Server',
    DATABASE = 'Database',
    STORAGE = 'Storage',
    BILLING = 'Billing'
}
