import type { TranslateResult } from 'vue-i18n';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import type { CostFiltersMap, Period } from '@/services/cost-explorer/type';

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

export interface UsdCost {
    [key: string]: number;
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
    filters: CostFiltersMap;
    currency: Currency;
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
