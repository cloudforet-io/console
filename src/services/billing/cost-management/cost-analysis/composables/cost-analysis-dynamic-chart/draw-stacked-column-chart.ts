import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { XYChart } from '@amcharts/amcharts4/charts';


const createCategoryAxis = (chart, categoryOptions) => {
    const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    let dateFormat = 'M/D';
    if (categoryOptions.timeUnit === 'month') dateFormat = 'MMM YYYY';
    else if (categoryOptions.timeUnit === 'year') dateFormat = 'YYYY';

    dateAxis.dataFields.category = 'date';
    dateAxis.renderer.minGridDistance = 35;
    dateAxis.fontSize = 12;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
    dateAxis.renderer.grid.template.strokeOpacity = 0;

    dateAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format(dateFormat));
    return dateAxis;
};

const createValueAxis = (chart) => {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 20;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.01;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
    valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);

    valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem) {
            if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
        }
        return text;
    });

    return valueAxis;
};

const createSeries = (chart, legend, timeUnit) => {
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name = legend.label;
    series.dataFields.categoryX = 'date';
    series.dataFields.valueY = legend.name;
    series.strokeWidth = 0;
    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
    series.tooltip.label.fontSize = 14;
    series.stacked = true;
    if (legend.color) series.columns.template.fill = legend.color;

    const today = dayjs.utc();
    series.columns.template.adapter.add('fillOpacity', (fillOpacity, target) => {
        if (today.isSame(dayjs(target.dataItem?.dataContext?.date), timeUnit)) {
            return 0.5;
        }
        return fillOpacity;
    });

    return series;
};

export default (data, chartContainer, valueOptions, categoryOptions): XYChart => {
    /* Chart Data must have data of last day, because AmCharts DateAxis not work properly if there's no last day. */

    const chart = am4core.create(chartContainer, am4charts.XYChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = data;

    createCategoryAxis(chart, categoryOptions);
    createValueAxis(chart);

    const timeUnit = categoryOptions.timeUnit || 'day';
    categoryOptions.legends.forEach((legend) => {
        createSeries(chart, legend, timeUnit);
    });

    return chart;
};
