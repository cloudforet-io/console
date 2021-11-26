import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { XYChart } from '@amcharts/amcharts4/charts';


const createCategoryAxis = (chart, categoryOptions) => {
    chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';
    const timeUnit = categoryOptions.timeUnit || 'day';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = {
        timeUnit,
        count: 1,
    };
    dateAxis.dateFormats.setKey('day', 'M/d');
    dateAxis.dateFormats.setKey('month', 'MMM YYYY');
    dateAxis.dateFormats.setKey('year', 'YYYY');

    dateAxis.dataFields.category = 'date';
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.fontSize = 12;
    dateAxis.renderer.grid.template.strokeOpacity = 1;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
    dateAxis.tooltip.label.fontSize = 12;
    dateAxis.renderer.grid.template.strokeOpacity = 0;

    // const range = dateAxis.axisRanges.create();
    // range.category = '2021-10-02';
    // range.endCategory = '2021-10-03';
    // range.axisFill.fill = am4core.color(red[300]);
    // range.axisFill.fillOpacity = 0.15;
    // range.label.disabled = true;
    // range.label.text = 'Rapid increase';
    // range.label.inside = true;
    // range.label.rotation = 90;
    // range.label.horizontalCenter = 'right';
    // range.label.verticalCenter = 'top';
    // range.label.fill = am4core.color(red[400]);

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
    valueAxis.tooltip.label.fontSize = 12;

    valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem) {
            // if (target.dataItem.value === 0) return '($USD) 0';
            if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
        }
        return text;
    });

    return valueAxis;
};

const createSeries = (chart, legend, timeUnit) => {
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name = legend.label;
    series.dataFields.dateX = 'date';
    series.dataFields.valueY = legend.name;
    series.strokeWidth = 0;
    series.columns.template.width = am4core.percent(60);
    series.tooltipText = '{name}: [bold]{valueY}[/]';
    series.tooltip.label.fontSize = 10;
    series.stacked = true;
    series.columns.template.propertyFields.fillOpacity = 'fillOpacity';

    const today = dayjs.utc();
    series.columns.template.adapter.add('fillOpacity', (fillOpacity, target) => {
        if (today.isSame(dayjs(target.dataItem.dateX), timeUnit)) {
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
    chart.scrollbarX = new am4core.Scrollbar();

    createCategoryAxis(chart, categoryOptions);
    createValueAxis(chart);

    const timeUnit = categoryOptions.timeUnit || 'day';
    categoryOptions.legends.forEach((legend) => {
        createSeries(chart, legend, timeUnit);
    });

    return chart;
};
