import type { XYChart } from '@amcharts/amcharts4/charts';
import {
    CategoryAxis, ValueAxis, ColumnSeries, LabelBullet,
} from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

import { palette } from '@/styles/colors.cjs';


const drawCategoryAxis = (chart: XYChart, nameOptions: DynamicField): CategoryAxis => {
    const categoryAxis = chart.yAxes.push(new CategoryAxis());
    categoryAxis.dataFields.category = nameOptions.key;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.disabled = true;
    return categoryAxis;
};


const drawValueAxis = (chart: XYChart): ValueAxis => {
    const valueAxis = chart.xAxes.push(new ValueAxis());
    // valueAxis.min = 0;
    // valueAxis.max = valueOptions.max;
    // valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;

    return valueAxis;
};

const drawCategoryLabelBullets = (series: ColumnSeries): LabelBullet => {
    const labelBullet = series.bullets.push(new LabelBullet());
    labelBullet.label.horizontalCenter = 'left';
    labelBullet.dy = -14;
    labelBullet.label.text = '{categoryY}';
    labelBullet.label.fill = am4core.color(palette.gray[900]);
    labelBullet.label.truncate = false;
    labelBullet.label.hideOversized = false;

    labelBullet.locationX = 1;
    labelBullet.fontFamily = 'Noto Sans';
    labelBullet.fontSize = 14;

    return labelBullet;
};

const drawValueLabelBullets = (series: ColumnSeries, valueOptions: DynamicField): LabelBullet => {
    const labelBullet = series.bullets.push(new LabelBullet());
    labelBullet.label.horizontalCenter = 'right';
    labelBullet.dy = -14;
    labelBullet.label.text = `{dataContext.${valueOptions.key}.formatNumber('#.0as')}`;
    labelBullet.label.fill = am4core.color(palette.gray[900]);
    labelBullet.label.truncate = false;
    labelBullet.label.hideOversized = false;

    labelBullet.locationX = 0;
    labelBullet.fontFamily = 'Noto Sans';
    labelBullet.fontWeight = 'bold';
    labelBullet.fontSize = 14;

    return labelBullet;
};

const drawValueColumnSeries = (chart: XYChart, nameOptions: DynamicField, valueOptions: DynamicField): ColumnSeries => {
    const series = chart.series.push(new ColumnSeries());
    series.name = 'value';
    series.dataFields.categoryY = nameOptions.key;
    series.dataFields.valueX = valueOptions.key;
    series.cursorTooltipEnabled = true;
    series.clustered = false;

    series.columns.template.tooltipText = '{valueX}';
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomLeft = 5;
    series.columns.template.column.cornerRadiusTopLeft = 5;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    series.columns.template.height = 4;
    series.columns.template.adapter.add('fill', () => am4core.color(palette.violet[400]));

    drawCategoryLabelBullets(series);
    return series;
};

const drawDummyColumnSeries = (chart: XYChart, nameOptions: DynamicField, valueOptions: DynamicField): ColumnSeries => {
    const series = chart.series.push(new ColumnSeries());
    series.name = 'dummy';
    series.dataFields.categoryY = nameOptions.key;
    series.dataFields.valueX = '_dummy';
    series.appeared = true;
    series.cursorTooltipEnabled = false;
    series.clustered = false;

    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomLeft = 5;
    series.columns.template.column.cornerRadiusTopLeft = 5;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    series.columns.template.adapter.add('fill', () => am4core.color(palette.gray[300]));
    series.columns.template.height = 4;

    drawValueLabelBullets(series, valueOptions);
    return series;
};


export const drawColumnChart = (chart: XYChart, nameOptions: DynamicField, valueOptions: DynamicField): void => {
    chart.padding(40, 40, 40, 40);
    chart.colors.step = 2;
    if (chart.hasLicense() && chart.logo) chart.logo.disabled = true;

    drawCategoryAxis(chart, nameOptions);
    drawValueAxis(chart);
    drawDummyColumnSeries(chart, nameOptions, valueOptions);
    drawValueColumnSeries(chart, nameOptions, valueOptions);

    chart.numberFormatter.numberFormat = '#.0as';
};
