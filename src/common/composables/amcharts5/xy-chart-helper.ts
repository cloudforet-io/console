import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IXYChartSettings } from '@amcharts/amcharts5/xy';
import * as am5xy from '@amcharts/amcharts5/xy';

import { gray } from '@/styles/colors';

export const createXYDateChart = (root: Root, settings?: IXYChartSettings): {
    chart: am5xy.XYChart,
    xAxis: am5xy.DateAxis<am5xy.AxisRenderer>,
    yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>
} => {
    const chart = root.container.children.push(am5xy.XYChart.new(root, {
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
