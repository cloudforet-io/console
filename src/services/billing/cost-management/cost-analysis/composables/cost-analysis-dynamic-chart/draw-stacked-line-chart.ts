import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { gray } from '@/styles/colors';
import config from '@/lib/config';
import { XYChart } from '@amcharts/amcharts4/charts';


const createCategoryAxis = (chart, categoryOptions) => {
    chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';

    const timeUnit = categoryOptions.timeUnit || 'day';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.startLocation = 0.5;
    dateAxis.endLocation = 0.5;
    dateAxis.baseInterval = {
        timeUnit,
        count: 1,
    };
    dateAxis.dateFormats.setKey('day', 'M/d');
    dateAxis.dateFormats.setKey('month', 'MMM YYYY');
    dateAxis.dateFormats.setKey('year', 'YYYY');
    dateAxis.renderer.minGridDistance = 50;
    dateAxis.fontSize = 12;
    dateAxis.renderer.grid.template.strokeOpacity = 0;
    dateAxis.renderer.grid.template.stroke = am4core.color(gray[500]);
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[900]);
    dateAxis.renderer.cellStartLocation = 0.1;
    dateAxis.renderer.cellEndLocation = 0.9;
    dateAxis.tooltip.label.fontSize = 12;

    return dateAxis;
};

const createValueAxis = (chart) => {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 20;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.01;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
    valueAxis.renderer.labels.template.fill = am4core.color(gray[900]);
    valueAxis.tooltip.label.fontSize = 12;

    return valueAxis;
};

const createSeries = (chart, legend) => {
    const series = chart.series.push(new am4charts.LineSeries());
    series.name = legend.label;
    series.dataFields.dateX = 'date';
    series.dataFields.valueY = legend.name;
    series.strokeWidth = 1;
    series.bulletsContainer.parent = chart.seriesContainer;
    series.tooltipText = '[font-size:10px]{name} {valueY}';

    // only in stacked column
    series.stacked = true;
    series.fillOpacity = 0.5;

    return series;
};

export default (data, chartContainer, valueOptions, categoryOptions): XYChart => {
    const chart = am4core.create(chartContainer, am4charts.XYChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = data;

    createCategoryAxis(chart, categoryOptions);
    createValueAxis(chart);

    categoryOptions.legends.forEach((d) => {
        createSeries(chart, d);
    });

    return chart;
};
