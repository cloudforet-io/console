import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IXYAxis } from '@amcharts/amcharts5/.internal/charts/xy/series/XYSeries';
import type { IXYChartSettings, IXYSeriesSettings } from '@amcharts/amcharts5/xy';
import * as am5xy from '@amcharts/amcharts5/xy';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { DATE_FIELD_NAME, CATEGORY_FIELD_NAME } from '@/common/composables/amcharts5/type';

import { gray } from '@/styles/colors';

// Chart
const createXYChart = (root: Root, settings?: IXYChartSettings): am5xy.XYChart => {
    const cursor = am5xy.XYCursor.new(root, {});
    cursor.lineX.setAll({
        visible: false,
    });
    cursor.lineY.setAll({
        visible: false,
    });

    return root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        maxTooltipDistance: -1,
        cursor,
        ...settings,
    }));
};

export const createXYDateChart = (root: Root, settings?: IXYChartSettings): {
    chart: am5xy.XYChart,
    xAxis: am5xy.DateAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>
} => {
    const chart = createXYChart(root, settings);

    const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[300]),
    });
    xRenderer.grid.template.setAll({
        strokeOpacity: 0,
    });
    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
        baseInterval: {
            timeUnit: 'month',
            count: 1,
        },
        renderer: xRenderer,
        dateFormats: {
            day: 'M/dd',
            month: 'MMM',
            year: 'yyyy',
        },
        periodChangeDateFormats: {
            day: 'M/dd',
            month: 'yyyy',
        },
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0,
    });
    yRenderer.grid.template.setAll({
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[200]),
    });
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
    }));
    return { chart, xAxis, yAxis };
};

export const createXYCategoryChart = (root: Root, settings?: IXYChartSettings): {
    chart: am5xy.XYChart,
    xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>
} => {
    const chart = createXYChart(root, settings);

    const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[300]),
    });
    xRenderer.grid.template.setAll({
        strokeOpacity: 0,
    });
    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: CATEGORY_FIELD_NAME,
        renderer: xRenderer,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0,
    });
    yRenderer.grid.template.setAll({
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[200]),
    });
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
    }));
    return { chart, xAxis, yAxis };
};

// Series
export const createXYLineSeries = (
    root: Root,
    chart: am5xy.XYChart,
    settings?: Partial<IXYSeriesSettings>,
): am5xy.XYSeries => {
    const series = chart.series.push(am5xy.LineSeries.new(root, {
        xAxis: chart.xAxes.getIndex(0) as IXYAxis,
        yAxis: chart.yAxes.getIndex(0) as IXYAxis,
        valueXField: DATE_FIELD_NAME,
        ...settings,
    }));
    series.strokes.template.setAll({
        strokeWidth: 2,
    });
    return series;
};

export const createXYStackedColumnSeries = (
    root: Root,
    chart: am5xy.XYChart,
    settings?: Partial<IXYSeriesSettings>,
): am5xy.XYSeries => chart.series.push(am5xy.ColumnSeries.new(root, {
    xAxis: chart.xAxes.getIndex(0) as IXYAxis,
    yAxis: chart.yAxes.getIndex(0) as IXYAxis,
    stacked: true,
    valueXField: DATE_FIELD_NAME,
    ...settings,
}));

// Tooltip
export const setXYSharedTooltipText = (chart: am5xy.XYChart, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    tooltip.label.adapters.add('text', (text, target) => {
        let _text = `[${gray[700]}]{valueX}[/]`;
        chart.series.each((s) => {
            const fieldName = s.get('valueYField') || '';
            let value = target.dataItem?.dataContext?.[fieldName];
            if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
            _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
        });
        return _text;
    });
};

export const setXYSingleTooltipText = (chart: am5xy.XYChart, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    let strokeColor;
    let fieldName;
    chart.series.each((series) => {
        strokeColor = series.get('stroke')?.toString();
        fieldName = series.get('name');
    });
    tooltip.label.setAll({
        fill: am5.color(gray[900]),
        fontSize: 14,
    });
    tooltip.label.adapters.add('text', (_, target) => {
        let value = target.dataItem?.dataContext?.[fieldName];
        if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
        return `[${strokeColor};fontSize: 10px]●[/] {valueX}: [bold]${value}[/]`;
    });
};
