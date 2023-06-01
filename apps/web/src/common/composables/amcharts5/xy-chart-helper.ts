import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IXYAxis } from '@amcharts/amcharts5/.internal/charts/xy/series/XYSeries';
import type { IDateAxisSettings, IXYChartSettings, IXYSeriesSettings } from '@amcharts/amcharts5/xy';
import * as am5xy from '@amcharts/amcharts5/xy';
import bytes from 'bytes';

import { byteFormatter } from '@cloudforet/core-lib';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { DEFAULT_CATEGORY_FIELD_NAME, DEFAULT_DATE_FIELD_NAME } from '@/common/composables/amcharts5/config';

import { gray } from '@/styles/colors';

import type { UnitMap } from '@/services/dashboards/widgets/_components/type';

// Chart
const createXYChart = (root: Root, settings?: IXYChartSettings): am5xy.XYChart => {
    const cursor = am5xy.XYCursor.new(root, {});
    cursor.lineX.setAll({
        visible: false,
        strokeDasharray: undefined,
        stroke: am5.color(gray[500]),
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
        pinchZoomX: false,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        ...settings,
    }));
};

export const createXYDateChart = (root: Root, settings?: IXYChartSettings, dateAxisSettings?: Partial<IDateAxisSettings<any>>): {
    chart: am5xy.XYChart,
    xAxis: am5xy.DateAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>
} => {
    const chart = createXYChart(root, settings);

    const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[300]),
        minGridDistance: 20,
    });
    xRenderer.grid.template.setAll({
        strokeOpacity: 0,
    });
    xRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(gray[600]),
        paddingTop: 6,
    });
    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
        extraMax: 0.01,
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
            month: 'MMM',
        },
        ...dateAxisSettings,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0,
        // minGridDistance: 20,
    });
    yRenderer.grid.template.setAll({
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[200]),
    });
    yRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(gray[600]),
        paddingRight: 8,
    });
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
        min: 0,
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
        categoryField: DEFAULT_CATEGORY_FIELD_NAME,
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

export const createXYHorizontalChart = (root: Root, settings?: IXYChartSettings): {
    chart: am5xy.XYChart,
    xAxis: am5xy.ValueAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>
} => {
    const chart = createXYChart(root, settings);

    const xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.grid.template.setAll({
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[200]),
    });
    xRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(gray[600]),
        paddingTop: 6,
    });
    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: xRenderer,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[300]),
        minGridDistance: 0,
    });
    yRenderer.grid.template.setAll({
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: am5.color(gray[200]),
    });
    yRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(gray[600]),
    });
    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: DEFAULT_CATEGORY_FIELD_NAME,
        renderer: yRenderer,
    }));
    return { chart, xAxis, yAxis };
};

// Series
export const createXYLineSeries = (
    root: Root,
    chart: am5xy.XYChart,
    settings?: Partial<IXYSeriesSettings>,
): am5xy.LineSeries => {
    const series = am5xy.LineSeries.new(root, {
        xAxis: chart.xAxes.getIndex(0) as IXYAxis,
        yAxis: chart.yAxes.getIndex(0) as IXYAxis,
        valueXField: DEFAULT_DATE_FIELD_NAME,
        maskBullets: false,
        ...settings,
    });
    series.strokes.template.setAll({
        strokeWidth: 2,
    });
    series.bullets.push(() => am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
            radius: 3,
            fill: series.get('fill'),
        }),
    }));
    return series;
};

export const createXYColumnSeries = (
    root: Root,
    chart: am5xy.XYChart,
    settings?: Partial<IXYSeriesSettings>,
): am5xy.ColumnSeries => {
    const series = am5xy.ColumnSeries.new(root, {
        xAxis: chart.xAxes.getIndex(0) as IXYAxis,
        yAxis: chart.yAxes.getIndex(0) as IXYAxis,
        valueXField: DEFAULT_DATE_FIELD_NAME,
        maskBullets: false,
        ...settings,
    });
    series.columns.template.setAll({
        width: am5.percent(45),
        height: am5.percent(45),
    });
    return series;
};

// Tooltip
export const setXYSharedTooltipText = (chart: am5xy.XYChart, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    tooltip.label.adapters.add('text', (text, target) => {
        let _text = `[${gray[700]}]{valueX}[/]`;
        chart.series.each((s) => {
            const fieldName = s.get('valueYField') || s.get('valueXField') || '';
            let value = target.dataItem?.dataContext?.[fieldName];
            if (value === undefined) value = '--';
            if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
            _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
        });
        return _text;
    });
};
export const setXYSharedTooltipTextByUsage = (chart: am5xy.XYChart, tooltip: am5.Tooltip, sourceUnit?: UnitMap): void => {
    tooltip.label.adapters.add('text', (text, target) => {
        let _text = `[${gray[700]}]{valueX}[/]`;
        chart.series.each((s) => {
            const fieldName = s.get('valueYField') || s.get('valueXField') || '';
            let value = target.dataItem?.dataContext?.[fieldName];
            if (value === undefined) value = '--';
            value = bytes.parse(`${value}${sourceUnit}`);
            value = byteFormatter(value);
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
        fieldName = series.get('valueYField') || '';
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
