import {
    Chart,
    ChartColor, ChartConfiguration,
    ChartDataSets,
    ChartOptions,
    ChartPluginsOptions,
    ChartPoint, ChartTooltipOptions,
    PluginServiceRegistrationOptions,
    Scriptable,
} from 'chart.js';
import { colorset } from '@/lib/util';
import {gray} from "@/styles/colors";

export interface SChartInterface extends Chart {
    metaDatasets: ChartDataSets;
    colors: string[];
    addData: (...args) => SChartInterface;
    setDatasets: (...args) => SChartInterface;
    setOptions: (...args) => SChartInterface;
    setPlugins: (...args) => SChartInterface;
    setLabels: (...args) => SChartInterface;
    setColors: (...args) => SChartInterface;
    apply: (...args) => SChartInterface;
}

export interface SettingsInterface {
    metaDatasets: ChartDataSets;
    options: ChartOptions;
    plugins: PluginServiceRegistrationOptions[];
}

export const tooltips: ChartTooltipOptions = {
    cornerRadius: 2,
    caretSize: 6,
    caretPadding: 8,
    displayColors: false,
    backgroundColor: gray[900],
};

export abstract class SChart extends Chart implements SChartInterface {
    colors: string[] = colorset as string[];

    protected getBackgroundColor: Scriptable<ChartColor> =
        ({ dataIndex }): ChartColor => this.colors[dataIndex || 0]

    protected getBorderColor: Scriptable<ChartColor> =
        ({ dataIndex }): ChartColor => this.colors[dataIndex || 0]

    metaDatasets: ChartDataSets = {
        backgroundColor: this.getBackgroundColor,
        borderColor: this.getBorderColor,
    };


    static initConfig(
        type: string,
        settings: SettingsInterface,
        config: ChartConfiguration,
    ): Chart.ChartConfiguration {
        return {
            type,
            options: settings.options,
            plugins: settings.plugins,
            ...config,
        };
    }

    addData(data: Array<number | null | undefined> | ChartPoint[], label?: string, render = false): this {
        if (!this.data.datasets) this.data.datasets = [];
        this.data.datasets.push({
            label,
            data,
        });
        if (render) this.update();
        return this;
    }

    setDatasets(datasets: ChartDataSets[]): this {
        this.data.datasets = datasets;
        return this;
    }

    setOptions(options: ChartOptions): this {
        this.options = {
            ...this.options,
            ...options,
        };
        return this;
    }

    setPlugins(plugins: ChartPluginsOptions): this {
        this.options.plugins = plugins;
        return this;
    }

    setLabels(labels: string[]): this {
        this.data.labels = labels;
        return this;
    }

    setColors(colors: string[]): this {
        this.colors = colors;
        return this;
    }

    apply(): this {
        this.data.datasets = this.data.datasets?.map((ds, i) => ({ ...ds, ...this.metaDatasets }));
        this.update();
        return this;
    }
}
