import type { Ref } from 'vue';
import {
    computed, reactive, toRefs, watchEffect,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { Root } from '@amcharts/amcharts5';
import type { IPieChartSettings } from '@amcharts/amcharts5/.internal/charts/pie/PieChart';
import type { PieChart, IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import type { IXYChartSettings, IXYSeriesSettings, XYChart } from '@amcharts/amcharts5/xy';

import { createDonutChart, createPieChart, createPieSeries } from '@/common/composables/amcharts5/pie-chart-helper';
import type { ChartContext } from '@/common/composables/amcharts5/type';
import { createXYDateChart, createXYLineSeries, createXYStackedColumnSeries } from '@/common/composables/amcharts5/xy-chart-helper';

export const useAmcharts5 = (
    chartContext: Ref<ChartContext>,
) => {
    const state = reactive({
        root: computed(() => (chartContext.value ? am5.Root.new(chartContext.value) : undefined)),
    });

    const initRoot = (root: Root): void => {
        root.setThemes([am5themes_Animated.new(root)]);
        root.utc = true;
    };

    const disposeRoot = () => {
        if (!state.root) return;
        am5.array.each(am5.registry.rootElements, (d) => {
            if (d === state.root) {
                d.dispose();
            }
        });
    };

    const clearChildrenOfRoot = () => {
        if (state.root) state.root.container.children.clear();
    };

    watchEffect(() => {
        if (state.root) initRoot(state.root);
    });

    return {
        ...toRefs(state),
        disposeRoot,
        clearChildrenOfRoot,
        //
        createXYDateChart: (settings?: IXYChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYDateChart(state.root, settings);
        },
        createPieChart: (settings?: IPieChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createPieChart(state.root, settings);
        },
        createDonutChart: (settings?: IPieChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createDonutChart(state.root, settings);
        },
        //
        createXYLineSeries: (chart: XYChart, settings: IXYSeriesSettings, processor?: am5.DataProcessor) => {
            if (!state.root) throw new Error('No root');
            return createXYLineSeries(state.root, chart, settings, processor);
        },
        createXYStackedColumnSeries: (chart: XYChart, settings: IXYSeriesSettings, processor?: am5.DataProcessor) => {
            if (!state.root) throw new Error('No root');
            return createXYStackedColumnSeries(state.root, chart, settings, processor);
        },
        createPieSeries: (chart: PieChart, settings?: IPieSeriesSettings) => {
            if (!state.root) throw new Error('No root');
            return createPieSeries(state.root, chart, settings);
        },
    };
};
