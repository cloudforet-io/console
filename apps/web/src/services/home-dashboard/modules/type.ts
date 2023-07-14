export interface DashboardWidgetProps {
    extraParams?: ExtraParams;
}

export type ExtraParams = Record<string, any>;

// AllSummary
export type DateType = 'DAILY' | 'MONTHLY';
export interface DateItem {
    name: DateType;
    label: string;
}

export const DATA_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
    BILLING: 'Billing',
} as const;
export type DataType = typeof DATA_TYPE[keyof typeof DATA_TYPE];
