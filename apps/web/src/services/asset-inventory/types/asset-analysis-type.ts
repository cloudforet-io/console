import type { TranslateResult } from 'vue-i18n';

import type { ManipulateType } from 'dayjs';

import type { NamespaceCategory, NamespaceGroup } from '@/schema/inventory/namespace/type';

import type {
    GRANULARITY, OPERATOR, METRIC_PERIOD_MENU, CHART_TYPE,
} from '@/services/asset-inventory/constants/asset-analysis-constant';


/* Options */
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

export type MetricFilter = Record<string, string[]>;

/* Display */
export type MetricPeriodMenu = typeof METRIC_PERIOD_MENU[keyof typeof METRIC_PERIOD_MENU];

export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export interface Legend {
    name: string;
    label: string | TranslateResult;
    color?: string;
    disabled?: boolean;
}

export type QueryFormMode = 'CREATE' | 'UPDATE' | 'VIEW';

/* Data */
export type MetricDataAnalyzeResult = {
    [groupBy: string]: string | any;
    count?: number | Array<{ date: string; value: number; }>;
    _total_count?: number;
    date?: string;
};

export interface XYChartData {
    date: string;
    totalCount?: number;
    [key: string]: any;
}

export interface TreemapChartData {
    children: RealtimeChartData[];
}

export interface RealtimeChartData {
    category?: string;
    value?: number;
    colorSettings?: { fill?: string; }
    background_color?: string;
    font_color?: string;
}

export interface NamespaceSubItemType {
    label: string;
    name: string;
    group: NamespaceGroup;
    category?: NamespaceCategory;
    resourceType?: string;
    icon: string;
}
