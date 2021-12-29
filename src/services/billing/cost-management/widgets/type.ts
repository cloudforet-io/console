import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { TranslateResult } from 'vue-i18n';
import { Period } from '@/services/billing/cost-management/type';

/* widget spec */
export interface ChartData {
    [key: string]: any;
}

export interface XYChartData {
    date: string;
    totalCost?: number;
    aggregation?: number;
    [key: string]: any;
}

export interface PieChartData {
    category: string;
    value: number;
    color?: string;
}

export interface Legend {
    name: string;
    label: string | TranslateResult;
    color?: string;
    disabled?: boolean;
}

export interface UsdCost {
    [key: string]: number;
}

export interface CostAnalyzeModel {
    total_usd_cost?: number;
    usd_cost: UsdCost | number;
    is_etc?: boolean;
    [key: string]: any;
}


/* component props */
export interface WidgetProps<Options = any> {
    options: Options;
    period: Period;
    filters: Record<string, string[]>;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}
