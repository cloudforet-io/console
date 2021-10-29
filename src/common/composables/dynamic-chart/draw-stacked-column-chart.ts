import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { gray, red } from '@/styles/colors';
import config from '@/lib/config';
import dayjs from 'dayjs';


const createCategoryAxis = (chart, categoryOptions) => {
    const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());

    let dateFormat = 'M/D';
    if (categoryOptions.timeUnit === 'month') dateFormat = 'MMM YYYY';
    else if (categoryOptions.timeUnit === 'year') dateFormat = 'YYYY';

    dateAxis.dataFields.category = 'date';
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.fontSize = 12;
    dateAxis.renderer.grid.template.strokeOpacity = 1;
    dateAxis.renderer.grid.template.stroke = am4core.color(gray[500]);
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[900]);
    dateAxis.tooltip.label.fontSize = 12;
    dateAxis.renderer.labels.template.adapter.add('text', (label, target) => {
        if (target.dataItem && (target.dataItem.category)) {
            return dayjs(target.dataItem.category).format(dateFormat);
        }
        return label;
    });
    dateAxis.renderer.grid.template.strokeOpacity = 0;

    //
    const range = dateAxis.axisRanges.create();
    range.category = '2021-10-02';
    range.endCategory = '2021-10-03';
    range.axisFill.fill = am4core.color(red[300]);
    range.axisFill.fillOpacity = 0.15;
    range.label.disabled = true;
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
    valueAxis.renderer.labels.template.fill = am4core.color(gray[900]);
    valueAxis.tooltip.label.fontSize = 12;

    return valueAxis;
};

const createSeries = (chart, legend) => {
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name = legend.label;
    series.dataFields.categoryX = 'date';
    series.dataFields.valueY = legend.name;
    series.strokeWidth = 0;
    series.columns.template.width = am4core.percent(60);
    series.tooltipText = '[font-size:10px]{name} {valueY}';
    series.stacked = true; // only in stacked column
    // series.columns.template.propertyFields.fillOpacity = 'fillOpacity'; // todo: fillOpacity

    return series;
};

export const drawStackedColumnChart = (data, chartContainer, valueOptions, categoryOptions) => {
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
