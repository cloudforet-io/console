import type { TreeMap, XYChart } from '@amcharts/amcharts4/charts';
import { PieChart } from '@amcharts/amcharts4/charts';

type ToggleSeries = (chart: XYChart | PieChart | TreeMap, index: number) => void;
type ToggleAllSeries = (chart: XYChart | PieChart | TreeMap) => void;

export const toggleSeries: ToggleSeries = (chart, index) => {
    if (chart instanceof PieChart) {
        const series = (chart as PieChart).series?.getIndex(0);
        if (!series) return;

        const slice = series.slices.values[index];
        if (!slice || !slice.dataItem) return;

        if (slice.isHiding || slice.isHidden) {
            slice.dataItem.show();
        } else {
            slice.dataItem.hide();
        }
    } else {
        const series = (chart as XYChart).series?.getIndex(index);
        if (!series) return;
        if (series.isHiding || series.isHidden) {
            series.show();
        } else {
            series.hide();
        }
    }
};
export const hideAllSeries: ToggleAllSeries = (chart) => {
    if (chart instanceof PieChart) {
        const series = chart.series.getIndex(0);
        if (!series) return;
        const slices = series.slices.values;
        slices.forEach((slice) => {
            if (slice.dataItem) slice.dataItem.hide();
        });
    } else {
        const series = chart.series.values;
        series.forEach((d) => {
            d.hide();
        });
    }
};
export const showAllSeries: ToggleAllSeries = (chart) => {
    if (chart instanceof PieChart) {
        const series = chart.series.getIndex(0);
        if (!series) return;
        const slices = series.slices.values;
        slices.forEach((slice) => {
            if (slice.dataItem) slice.dataItem.show();
        });
    } else {
        const series = chart.series.values;
        series.forEach((d) => {
            d.show();
        });
    }
};
