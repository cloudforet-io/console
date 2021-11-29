import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { TranslateResult } from 'vue-i18n';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';

/* widget spec */
export interface ChartData {
    [key: string]: any;
}

interface TableRawValue {
    date: string;
    usd_cost?: number;
}
export interface TableRawData {
    values: TableRawValue[];
    [key: string]: any;
}
export interface TableData {
    [key: string]: any;
}

interface XYChartRawValue {
    usd_cost: number;
    [key: string]: any;
}
export interface XYChartRawData {
    date: string;
    values: XYChartRawValue[];
}
export interface XYChartData {
    date: string;
    totalCost?: number;
    [key: string]: any;
}

export interface PieChartRawData {
    usd_cost: number;
    [key: string]: any;
}
export interface PieChartData {
    category: string;
    value: number;
}

export interface Legend {
    name: string;
    label: string | TranslateResult;
    disabled?: boolean;
}


/* component props */
export interface WidgetProps<Options = any> {
    options: Options;
    period: Period;
    filters: Record<string, string[]>;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}
