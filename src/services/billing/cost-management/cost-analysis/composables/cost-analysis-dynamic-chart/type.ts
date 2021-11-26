import { ComputedRef } from '@vue/composition-api';
import { TimeUnit } from '@amcharts/amcharts4/core';
import { ChartData, Legend } from '@/services/billing/cost-management/widgets/type';


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
