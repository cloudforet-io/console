import {
    LabelBullet, TreeMap, TreeMapSeries,
} from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { palette } from '@/styles/colors';

const drawSeriesLabelBullet = (series: TreeMapSeries, nameOptions: DynamicField, valueOptions: DynamicField): LabelBullet => {
    const labelBullet = series.bullets.push(new LabelBullet());
    labelBullet.locationY = 0.5;
    labelBullet.locationX = 0.5;
    labelBullet.label.text = `[font-size: 1rem; bold]{${nameOptions.key}}[/]
[font-size: 1.125rem; text-align: center]{${valueOptions.key}}`;

    return labelBullet;
};

export const drawTreemapChart = (chart: TreeMap, nameOptions: DynamicField, valueOptions: DynamicField) => {
    if (chart.hasLicense()) chart.logo.disabled = true;

    chart.dataFields.value = valueOptions.key;
    chart.dataFields.name = nameOptions.key;
    chart.colors.baseColor = am4core.color(palette.violet[700]);
    chart.colors.step = 2;

    const seriesTemplates = chart.seriesTemplates.create('0');
    seriesTemplates.strokeWidth = 2;

    drawSeriesLabelBullet(seriesTemplates, nameOptions, valueOptions);
};

export const drawDummyTreemapChart = (chart: TreeMap, nameOptions: DynamicField, valueOptions: DynamicField) => {
    if (chart.hasLicense()) chart.logo.disabled = true;

    chart.dataFields.value = valueOptions.key;
    chart.dataFields.name = nameOptions.key;

    const seriesTemplates = chart.seriesTemplates.create('0');
    seriesTemplates.strokeWidth = 2;
    if (seriesTemplates.tooltip) seriesTemplates.tooltip.disabled = true;

    seriesTemplates.columns.template.fill = am4core.color(palette.gray[300]);

    chart.data = [{
        [nameOptions.key]: 'Dummy',
        [valueOptions.key]: 1000,
    }];
};
