import { TranslateResult } from 'vue-i18n';
import { ComputedRef } from '@vue/composition-api';
import * as am4charts from '@amcharts/amcharts4/charts';

export interface ChartData {
    [key: string]: any;
}
export interface Legend {
    name: string;
    label: string | TranslateResult;
}

interface CategoryOptions {
    legends: ComputedRef<Legend[]>;
    path: string;
    timeUnit?: 'day' | 'month' | 'year';
}

// interface ValueOptions {
// }

export interface DynamicChartStateArgs {
    data: ComputedRef<ChartData[]> | ChartData[];
    valueOptions?: any;
    categoryOptions?: CategoryOptions;
    chartContainer: HTMLElement;
}
