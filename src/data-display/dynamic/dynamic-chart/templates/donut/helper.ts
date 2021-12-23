import * as am4core from '@amcharts/amcharts4/core';
import { PieSeries, PieChart } from '@amcharts/amcharts4/charts';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { palette } from '@/styles/colors';

const drawPieSeries = (chart: PieChart, nameOptions: DynamicField, valueOptions: DynamicField): PieSeries => {
    const series = chart.series.push(new PieSeries());
    series.dataFields.value = valueOptions.key;
    series.dataFields.category = nameOptions.key;

    series.labels.template.disabled = true;
    if (series.tooltip) series.tooltip.disabled = false;

    const sliceTemplate = series.slices.template;
    sliceTemplate.clickable = false;
    sliceTemplate.properties.hoverable = false;
    sliceTemplate.tooltipText = '{category}: $ {value}';

    const sliceKeys = sliceTemplate.states.getKey('hover');
    if (sliceKeys) sliceKeys.properties.scale = 1;

    /* This creates initial animation */
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    return series;
};

export const drawDummyPieChart = (chart: PieChart, nameOptions: DynamicField, valueOptions: DynamicField) => {
    chart.innerRadius = am4core.percent(65);
    if (chart.hasLicense()) chart.logo.disabled = true;

    const series = chart.series.push(new PieSeries());
    series.dataFields.value = valueOptions.key;
    series.dataFields.category = nameOptions.key;

    series.labels.template.disabled = true;
    if (series.tooltip) series.tooltip.disabled = true;

    const sliceTemplate = series.slices.template;
    sliceTemplate.clickable = false;
    sliceTemplate.properties.hoverable = false;
    sliceTemplate.tooltipText = '';
    sliceTemplate.fill = am4core.color(palette.gray[300]);
    sliceTemplate.fillOpacity = 0.3;
    sliceTemplate.strokeOpacity = 0;

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.data = [{
        [nameOptions.key]: 'Dummy',
        [valueOptions.key]: 1000,
    }];
};

export const drawPieChart = (chart: PieChart, nameOptions: DynamicField, valueOptions: DynamicField) => {
    chart.innerRadius = am4core.percent(65);
    if (chart.hasLicense()) chart.logo.disabled = true;

    const series = drawPieSeries(chart, nameOptions, valueOptions);

    const label = series.createChild(am4core.Label);
    label.text = '{values.value.sum}';
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'middle';
    label.fontSize = 18;
};
