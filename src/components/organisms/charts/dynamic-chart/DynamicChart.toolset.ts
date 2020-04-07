import Chart, {
    ChartDataSets, ChartOptions, ChartPluginsOptions, ChartTooltipOptions,
} from 'chart.js';
import { gray } from '@/styles/colors';
import { colorset } from '@/lib/util';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet,
} from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export const dynamicChartProps = {
    /**
     * This is for X axes
     */
    labels: {
        type: Array,
        default: undefined,
    },
    dataset: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: true,
    },
    styleType: {
        type: String,
        default: 'default',
    },
    themeProps: {
        type: Object,
        default: () => ({
            colors: colorset,
        }),
    },
};

export class ChartData {
    label: string;

    data: number[];

    constructor(label: string, data: number[]) {
        this.label = label;
        this.data = data;
    }
}

export interface DefaultThemePropsType {
    colors: string[];
}

export const defaultThemeProps = {
    colors: colorset,
} as DefaultThemePropsType;


export interface DynamicChartPropsType<T extends DefaultThemePropsType = DefaultThemePropsType> {
    type: string;
    labels?: string[];
    dataset: ChartData[];
    loading: boolean;
    styleType: string;
    themeProps: T;
}


@StateToolSet<DynamicChartPropsType>()
export class DynamicChartState<D, S extends DynamicChartPropsType = DynamicChartPropsType> {
    state: optionalType<S, D>;

    static initState(): DynamicChartPropsType {
        return {
            type: 'line',
            labels: [],
            dataset: [],
            loading: true,
            styleType: 'default',
            themeProps: defaultThemeProps,
        };
    }

    constructor(initData: D = {} as D, lazy = false) {
        this.state = initReactive(lazy, DynamicChartState.initState(), initData);
    }
}

export interface ChartSettingsType<T extends DefaultThemePropsType = DefaultThemePropsType> {
    (themeProps: T, chartRef: HTMLCanvasElement, dataset: ChartData[]): {(index: number): ChartDataSets};
}

export interface ChartOptionsType<T extends DefaultThemePropsType = DefaultThemePropsType> {
    (themeProps: T, dataset: ChartData[]): ChartOptions;
}

export interface ChartPluginsType<T extends DefaultThemePropsType = DefaultThemePropsType> {
    (themeProps: T, dataset: ChartData[]): ChartPluginsOptions;
}

export interface ChartThemeType<T extends DefaultThemePropsType = DefaultThemePropsType> {
    settings: ChartSettingsType<T | DefaultThemePropsType>;
    options: ChartOptionsType<T | DefaultThemePropsType>;
    plugins: ChartPluginsType<T | DefaultThemePropsType>;
}

export interface ChartThemeGroupType<T extends DefaultThemePropsType> {
    default: ChartThemeType<T>;
    [theme: string]: ChartThemeType<T>;
}

export const tooltips: ChartTooltipOptions = {
    cornerRadius: 2,
    caretSize: 6,
    caretPadding: 8,
    displayColors: false,
    backgroundColor: gray[900],
};

export const defaultSettings = () => (): ChartDataSets => ({});

export const defaultOptions = (): ChartOptions => ({});

export const defaultPlugins = (): ChartPluginsOptions => [{ tooltips }];

export const defaultTheme: ChartThemeGroupType<DefaultThemePropsType> = {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
};
