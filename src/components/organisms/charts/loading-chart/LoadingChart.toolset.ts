import Chart, {
    ChartDataSets, ChartElementsOptions, ChartLineOptions, ChartOptions, ChartPluginsOptions,
} from 'chart.js';
import hexToRgba from 'hex-to-rgba';
import {
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';

export class ChartData {
    label: string;

    data: number[];

    constructor(label: string, data: number[]) {
        this.label = label;
        this.data = data;
    }
}

export interface LoadingChartPropsType {
    type: string;
    labels: any[];
    dataset: ChartData[];
    loading: boolean;
    gradient: boolean;
}

export const loadingChartProps = {
    /**
     * This is for X axes
     */
    labels: {
        type: Array,
        default: () => [],
    },
    dataset: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: 'line',
    },
    loading: {
        type: Boolean,
        default: true,
    },
    gradient: {
        type: Boolean,
        default: true,
    },
};

export type SettingsType<T extends LoadingChartPropsType> = (props: T) => ChartDataSets

export type OptionsType<T extends LoadingChartPropsType> = (props: T) => ChartOptions

export type PluginsType<T extends LoadingChartPropsType> = (props: T) => ChartPluginsOptions
