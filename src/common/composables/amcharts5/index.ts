import type { Ref } from 'vue';
import {
    reactive, toRefs, watch,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { ITooltipSettings, Root } from '@amcharts/amcharts5';
import type { IPieChartSettings } from '@amcharts/amcharts5/.internal/charts/pie/PieChart';
import type { PieChart, IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import type { IXYChartSettings, IXYSeriesSettings, XYChart } from '@amcharts/amcharts5/xy';

import { Amcharts5GlobalTheme } from '@/lib/site-initializer/amcharts5';

import { createDonutChart, createPieChart, createPieSeries } from '@/common/composables/amcharts5/pie-chart-helper';
import type { ChartContext } from '@/common/composables/amcharts5/type';
import {
    createXYCategoryChart, createXYDateChart, createXYLineSeries, createXYStackedColumnSeries, createXYTooltip,
} from '@/common/composables/amcharts5/xy-chart-helper';

export const useAmcharts5 = (
    chartContext: Ref<ChartContext>,
) => {
    const state = reactive({
        chartContext,
        root: undefined as undefined | Root,
    });

    const initRoot = (root: Root) => {
        root.setThemes([am5themes_Animated.new(root), Amcharts5GlobalTheme.new(root)]);
        root.utc = true;
        root.dateFormatter.setAll({
            dateFormat: 'MMMM, yyyy',
            dateFields: ['valueX'],
        });
    };

    const disposeRoot = () => {
        if (!state.root) return;
        state.root.dispose();
        state.root = undefined;
    };

    const clearChildrenOfRoot = () => {
        if (state.root) state.root.container.children.clear();
    };

    watch(() => state.chartContext, (ctx) => {
        if (ctx) {
            disposeRoot();
            state.root = am5.Root.new(ctx);
            initRoot(state.root as Root);
        }
    });

    return {
        ...toRefs(state),
        disposeRoot,
        clearChildrenOfRoot,
        //
        createXYDateChart: (settings?: IXYChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYDateChart(state.root as Root, settings);
        },
        createXYCategoryChart: (settings?: IXYChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYCategoryChart(state.root as Root, settings);
        },
        createPieChart: (settings?: IPieChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createPieChart(state.root as Root, settings);
        },
        createDonutChart: (settings?: IPieChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createDonutChart(state.root as Root, settings);
        },
        //
        createXYLineSeries: (chart: XYChart, settings?: Partial<IXYSeriesSettings>) => {
            if (!state.root) throw new Error('No root');
            return createXYLineSeries(state.root as Root, chart, settings);
        },
        createXYStackedColumnSeries: (chart: XYChart, settings?: Partial<IXYSeriesSettings>) => {
            if (!state.root) throw new Error('No root');
            return createXYStackedColumnSeries(state.root as Root, chart, settings);
        },
        createPieSeries: (chart: PieChart, settings?: IPieSeriesSettings) => {
            if (!state.root) throw new Error('No root');
            return createPieSeries(state.root as Root, chart, settings);
        },
        //
        createXYTooltip: (chart: XYChart, settings?: ITooltipSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYTooltip(state.root as Root, chart, settings);
        },
    };
};
