import type { PieChart } from '@amcharts/amcharts4/charts';
import { PieSeries } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import { drawSeriesTooltip } from '@/data-display/dynamic/dynamic-chart/helper';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

const drawPieSeries = (chart: PieChart, nameOptions: DynamicField, valueOptions: DynamicField, colors: string[]): PieSeries => {
    const series = chart.series.push(new PieSeries());
    series.dataFields.value = valueOptions.key;
    series.dataFields.category = nameOptions.key;

    series.labels.template.disabled = true;

    drawSeriesTooltip(series, nameOptions);

    const sliceTemplate = series.slices.template;
    sliceTemplate.clickable = false;
    sliceTemplate.properties.hoverable = false;

    const sliceKeys = sliceTemplate.states.getKey('hover');
    if (sliceKeys) sliceKeys.properties.scale = 1;

    /* This creates initial animation */
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    series.colors.list = colors.map((d) => am4core.color(d));
    return series;
};

export const drawPieChart = (chart: PieChart, nameOptions: DynamicField, valueOptions: DynamicField, colors: string[]) => {
    chart.innerRadius = am4core.percent(65);
    if (chart.hasLicense() && chart.logo) chart.logo.disabled = true;

    drawPieSeries(chart, nameOptions, valueOptions, colors);
};
