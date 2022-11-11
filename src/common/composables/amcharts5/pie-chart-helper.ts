import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IPieChartSettings } from '@amcharts/amcharts5/.internal/charts/pie/PieChart';
import * as am5percent from '@amcharts/amcharts5/percent';
import type { IPieSeriesSettings } from '@amcharts/amcharts5/percent';

export const createPieChart = (root: Root, settings?: IPieChartSettings): { chart: am5percent.PieChart } => {
    const chart = root.container.children.push(am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        ...settings,
    }));
    return { chart };
};

export const createDonutChart = (root: Root, settings?: IPieChartSettings): { chart: am5percent.PieChart } => {
    const chart = root.container.children.push(am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(85),
        ...settings,
    }));
    return { chart };
};

export const createPieSeries = (root: Root, chart: am5percent.PieChart, settings?: IPieSeriesSettings): am5percent.PieSeries => {
    const series = chart.series.push(am5percent.PieSeries.new(root, {
        ...settings,
    }));
    series.ticks.template.set('visible', false);
    series.labels.template.set('forceHidden', true);
    series.slices.template.setAll({
        toggleKey: 'none',
        forceInactive: true,
    });
    return series;
};
