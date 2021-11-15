import { TranslateResult } from 'vue-i18n';
import { ComputedRef } from '@vue/composition-api';
import { TimeUnit } from '@amcharts/amcharts4/core';


export interface ChartData {
    [key: string]: any;
}
export interface Legend {
    name: string;
    label: string | TranslateResult;
    disabled?: boolean;
}


interface CategoryOptions {
    legends: ComputedRef<Legend[]>;
    path: string;
    timeUnit?: TimeUnit;
}

// interface ValueOptions {
// }

export interface DynamicChartStateArgs {
    data: ComputedRef<ChartData[]> | ChartData[];
    valueOptions?: any;
    categoryOptions?: CategoryOptions;
    chartContainer: HTMLElement;
}
