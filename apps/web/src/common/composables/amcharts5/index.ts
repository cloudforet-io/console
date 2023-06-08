import type { Ref } from 'vue';
import {
    reactive, toRef, watch,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { Root } from '@amcharts/amcharts5';
import type * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import type * as am5map from '@amcharts/amcharts5/map';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import type * as am5xy from '@amcharts/amcharts5/xy';

import { Amcharts5GlobalTheme } from '@/lib/site-initializer/amcharts5';

import {
    createBullet, createCircle, createDataProcessor, createLabel, createLegend, createTooltip, toggleSeries,
} from '@/common/composables/amcharts5/concepts-helper';
import { createMapChart, createMapPointSeries, createMapPolygonSeries } from '@/common/composables/amcharts5/map-chart-helper';
import {
    createDonutChart, createPieChart, createPieSeries, setPieLabelText, setPieTooltipText,
} from '@/common/composables/amcharts5/pie-chart-helper';
import { createTreeMapSeries, setTreemapTooltipText, setTreemapLabelText } from '@/common/composables/amcharts5/tree-map-helper';
import type { ChartContext } from '@/common/composables/amcharts5/type';
import {
    createXYCategoryChart, createXYDateChart, createXYLineSeries, createXYColumnSeries,
    setXYSharedTooltipText, setXYSingleTooltipText, createXYHorizontalChart, setXYSharedTooltipTextByUsage,
} from '@/common/composables/amcharts5/xy-chart-helper';


export const useAmcharts5 = (
    chartContext: Ref<ChartContext>,
) => {
    const state = reactive({
        chartContext,
        root: undefined as undefined | Root,
    });

    const refreshRoot = () => {
        disposeRoot();
        if (state.chartContext) {
            const root = am5.Root.new(state.chartContext as HTMLElement);
            state.root = root;
            initRoot(root);
        }
    };

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

    const setChartColors = (chart: am5.SerialChart | am5hierarchy.Treemap, colors: string[]) => {
        if (colors.length === 0) return;
        const am5ColorSet = colors.map((color) => am5.color(color));
        if (chart instanceof am5percent.PieChart) {
            chart.series.getIndex(0)?.get('colors')?.set('colors', am5ColorSet);
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chart.get('colors')?.set('colors', am5ColorSet);
        }
    };

    watch(() => state.chartContext, (ctx) => {
        if (ctx) {
            disposeRoot();
            state.root = am5.Root.new(ctx);
            initRoot(state.root as Root);
        }
    });

    return {
        root: toRef(state, 'root'),
        refreshRoot,
        disposeRoot,
        clearChildrenOfRoot,
        //
        createXYDateChart: (settings?: am5xy.IXYChartSettings, dateAxisSettings?: Partial<am5xy.IDateAxisSettings<any>>) => {
            if (!state.root) throw new Error('No root');
            return createXYDateChart(state.root as Root, settings, dateAxisSettings);
        },
        createXYCategoryChart: (settings?: am5xy.IXYChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYCategoryChart(state.root as Root, settings);
        },
        createXYHorizontalChart: (settings?: am5xy.IXYChartSettings) => {
            if (!state.root) throw new Error('No root');
            return createXYHorizontalChart(state.root as Root, settings);
        },
        createPieChart: (settings?: am5percent.IPieChartSettings): am5percent.PieChart => {
            if (!state.root) throw new Error('No root');
            return createPieChart(state.root as Root, settings);
        },
        createDonutChart: (settings?: am5percent.IPieChartSettings): am5percent.PieChart => {
            if (!state.root) throw new Error('No root');
            return createDonutChart(state.root as Root, settings);
        },
        createMapChart: (settings?: am5map.IMapChartSettings): am5map.MapChart => {
            if (!state.root) throw new Error('No root');
            return createMapChart(state.root as Root, settings);
        },
        //
        createXYLineSeries: (chart: am5xy.XYChart, settings?: Partial<am5xy.IXYSeriesSettings>): am5xy.LineSeries => {
            if (!state.root) throw new Error('No root');
            return createXYLineSeries(state.root as Root, chart, settings);
        },
        createXYColumnSeries: (chart: am5xy.XYChart, settings?: Partial<am5xy.IXYSeriesSettings>): am5xy.ColumnSeries => {
            if (!state.root) throw new Error('No root');
            return createXYColumnSeries(state.root as Root, chart, settings);
        },
        createPieSeries: (settings?: am5percent.IPieSeriesSettings): am5percent.PieSeries => {
            if (!state.root) throw new Error('No root');
            return createPieSeries(state.root as Root, settings);
        },
        createMapPolygonSeries: (settings?: am5map.IMapPolygonSeriesSettings): am5map.MapPolygonSeries => {
            if (!state.root) throw new Error('No root');
            return createMapPolygonSeries(state.root as Root, settings);
        },
        createMapPointSeries: (settings?: am5map.IMapPointSeriesSettings): am5map.MapPointSeries => {
            if (!state.root) throw new Error('No root');
            return createMapPointSeries(state.root as Root, settings);
        },
        createTreeMapSeries: (settings?: am5hierarchy.ITreemapSettings): am5hierarchy.Treemap => {
            if (!state.root) throw new Error('No root');
            return createTreeMapSeries(state.root as Root, settings);
        },
        //
        createTooltip: (settings?: am5.ITooltipSettings): am5.Tooltip => {
            if (!state.root) throw new Error('No root');
            return createTooltip(state.root as Root, settings);
        },
        createLegend: (settings?: am5.ILegendSettings): am5.Legend => {
            if (!state.root) throw new Error('No root');
            return createLegend(state.root as Root, settings);
        },
        createBullet: (settings: am5.IBulletSettings): am5.Bullet => {
            if (!state.root) throw new Error('No root');
            return createBullet(state.root as Root, settings);
        },
        createLabel: (settings: am5.ILabelSettings): am5.Label => {
            if (!state.root) throw new Error('No root');
            return createLabel(state.root as Root, settings);
        },
        createCircle: (settings: am5.ICircleSettings, circleTemplate: am5.Template<am5.Circle>): am5.Circle => {
            if (!state.root) throw new Error('No root');
            return createCircle(state.root as Root, settings, circleTemplate);
        },
        createDataProcessor: (settings: am5.IDataProcessorSettings): am5.DataProcessor => {
            if (!state.root) throw new Error('No root');
            return createDataProcessor(state.root as Root, settings);
        },
        setXYSharedTooltipText,
        setXYSharedTooltipTextByUsage,
        setXYSingleTooltipText,
        setPieTooltipText,
        setPieLabelText,
        setTreemapTooltipText,
        setTreemapLabelText,
        setChartColors,
        toggleSeries,
    };
};
