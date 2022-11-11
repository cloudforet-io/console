import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IXYChartSettings, IXYSeriesSettings } from '@amcharts/amcharts5/xy';
import * as am5xy from '@amcharts/amcharts5/xy';

import { DATE_VALUE_FIELD } from '@/common/composables/amcharts5/type';

import { gray, white } from '@/styles/colors';

const createTooltip = (root: Root, chart: am5xy.XYChart, isSingle = true): am5.Tooltip => {
    const tooltip = am5.Tooltip.new(root, {
        getFillFromSprite: false,
        getStrokeFromSprite: false,
        autoTextColor: false,
    });
    tooltip.label.setAll({
        text: '{categoryX} [bold]{valueY}[/]',
        fill: am5.color(gray[900]),
        fontSize: 14,
    });
    tooltip.get('background')?.setAll({
        fill: am5.color(white),
        stroke: am5.color(gray[300]),
        fillOpacity: 0.9,
    });
    if (!isSingle) {
        tooltip.label.adapters.add('text', (text) => {
            let _text = text;
            chart.series.each((series) => {
                _text += `\n[${series.get('stroke')?.toString()}]●[/] [bold width:100px]${series.get('name')}:[/] {${series.get('valueYField')}}`;
            });
            return _text;
        });
    }
    return tooltip;
};

export const createXYDateChart = (root: Root, settings?: IXYChartSettings): {
    chart: am5xy.XYChart,
    xAxis: am5xy.DateAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>
} => {
    const cursor = am5xy.XYCursor.new(root, {});
    cursor.lineX.setAll({
        visible: false,
    });
    cursor.lineY.setAll({
        visible: false,
    });

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        maxTooltipDistance: -1,
        cursor,
        ...settings,
    }));

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
            timeUnit: 'day',
            count: 1,
        },
        renderer: xRenderer,
        dateFormats: {
            day: 'M/dd',
            month: 'MMM',
        },
        periodChangeDateFormats: {
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

export const createXYLineSeries = (root: Root, chart: am5xy.XYChart, settings: IXYSeriesSettings, processor?: am5.DataProcessor) => {
    const series = chart.series.push(am5xy.LineSeries.new(root, {
        valueXField: DATE_VALUE_FIELD,
        tooltip: createTooltip(root, chart, false),
        ...settings,
    }));
    if (processor) series.data.processor = processor;
    series.strokes.template.setAll({
        strokeWidth: 2,
    });
    return series;
};

export const createXYStackedColumnSeries = (root: Root, chart: am5xy.XYChart, settings: IXYSeriesSettings, processor?: am5.DataProcessor) => {
    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
        stacked: true,
        valueXField: DATE_VALUE_FIELD,
        tooltip: am5.Tooltip.new(root, {
            labelText: '{valueY}',
        }),
        ...settings,
    }));
    if (processor) series.data.processor = processor;
    return series;
};
