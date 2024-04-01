import type { TranslateResult } from 'vue-i18n';

import type { ManipulateType } from 'dayjs';

import type {
    GRANULARITY, OPERATOR, METRIC_PERIOD_MENU, CHART_TYPE,
} from '@/services/asset-inventory/constants/metric-explorer-constant';


export interface Period {
    start?: string;
    end?: string;
}

export type RelativePeriod = {
    unit: ManipulateType;
    value: number;
    include_today: boolean;
};

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];

export type Operator = typeof OPERATOR[keyof typeof OPERATOR];

export interface MetricNamespace {
    provider: string;
    cloud_service_group: string;
    cloud_service_type: string;
}

export type MetricPeriodMenu = typeof METRIC_PERIOD_MENU[keyof typeof METRIC_PERIOD_MENU];

export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export interface Legend {
    name: string;
    label: string | TranslateResult;
    disabled?: boolean;
}

export type MetricDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum?: Array<{ date: string; value: number; }>;
    value_avg?: Array<{ date: string; value: number; }>;
    value_max?: Array<{ date: string; value: number; }>;
    value_min?: Array<{ date: string; value: number; }>;
    _total_value_sum?: number;
};

export interface XYChartData {
    date: string;
    totalCost?: number;
    [key: string]: any;
}
