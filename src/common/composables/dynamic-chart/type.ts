import { TranslateResult } from 'vue-i18n';
import { ComputedRef } from '@vue/composition-api';
import * as am4charts from '@amcharts/amcharts4/charts';

interface ChartData {
    [key: string]: any;
}
interface Legend {
    name: string;
    label: string | TranslateResult;
}

interface CategoryOptions {
    legends: ComputedRef<Legend[]>;
    path: string;
}

export interface DynamicChartStateArgs {
    data: ComputedRef<ChartData[]> | ChartData[];
    valueOptions: any;
    categoryOptions: CategoryOptions;
    chartContainer: HTMLElement;
}

export type DrawChartType = (data: any[], chartContainer: HTMLElement, legends: Legend[]) => am4charts.XYChart | am4charts.PieChart;
