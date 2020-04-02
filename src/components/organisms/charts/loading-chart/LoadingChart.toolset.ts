import Chart, {
    ChartDataSets, ChartElementsOptions, ChartLineOptions, ChartOptions, ChartPluginsOptions,
} from 'chart.js';
import hexToRgba from 'hex-to-rgba';
import {
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import { gray } from '@/styles/colors';

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
    styleType: string;
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
    styleType: {
        type: String,
        default: 'default',
    },
};

export type SettingsType<T extends LoadingChartPropsType> = (props: T) => ChartDataSets

export type OptionsType<T extends LoadingChartPropsType> = (props: T) => ChartOptions

export type PluginsType<T extends LoadingChartPropsType> = (props: T) => ChartPluginsOptions

export const tooltips = {
    cornerRadius: 2,
    caretSize: 6,
    caretPadding: 8,
    displayColors: false,
    backgroundColor: gray[900],
};
