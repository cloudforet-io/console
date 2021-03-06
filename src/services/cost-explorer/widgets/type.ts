import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { TranslateResult } from 'vue-i18n';
import { Period } from '@/services/cost-explorer/type';

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
    value: number | UsdCost;
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
    is_others?: boolean;
    [key: string]: any;
}


/* component props */
export interface WidgetProps<Options = any> {
    widgetId?: string;
    name?: string;
    options: Options;
    period: Period;
    filters: Record<string, string[]>;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
    printMode?: boolean;
}

export interface TrafficWidgetTableData {
    trafficOutCost?: number;
    trafficOutSize?: number;
    trafficInCost?: number;
    trafficInSize?: number;
    trafficEtcCost?: number;
    trafficEtcSize?: number;
}
