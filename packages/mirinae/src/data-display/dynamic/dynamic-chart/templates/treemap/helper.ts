import type { TreeMap, TreeMapSeries } from '@amcharts/amcharts4/charts';
import {
    LabelBullet,
} from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import { drawSeriesTooltip } from '@/data-display/dynamic/dynamic-chart/helper';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

import { palette } from '@/styles/colors';

const drawSeriesLabelBullet = (series: TreeMapSeries, nameOptions: DynamicField, totalValue: number): LabelBullet => {
    const labelBullet = series.bullets.push(new LabelBullet());
    labelBullet.locationY = 0.5;
    labelBullet.locationX = 0.5;
    labelBullet.label.adapter.add('text', (text, target: any) => {
        if (target.dataItem?.value) {
            const percentage = (100 * target.dataItem.value) / totalValue;
            if (percentage >= 5) {
                return `[font-size: 14px; {textColor};]{${nameOptions.key}}[/]`;
            }
        }
        return '';
    });
    return labelBullet;
};

const drawSeries = (chart: TreeMap, nameOptions: DynamicField): TreeMapSeries => {
    const series = chart.seriesTemplates.create('0');
    series.columns.template.stroke = am4core.color('white');
    series.columns.template.strokeWidth = 3;
    series.columns.template.strokeOpacity = 1;
    return drawSeriesTooltip(series, nameOptions) as TreeMapSeries;
};

export const drawTreemapChart = (chart: TreeMap, nameOptions: DynamicField, valueOptions: DynamicField, totalValue: number) => {
    if (chart.hasLicense() && chart.logo) chart.logo.disabled = true;

    chart.paddingTop = 0;
    chart.paddingBottom = 0;
    chart.paddingLeft = 0;
    chart.paddingRight = 0;

    chart.colors.step = 1;

    chart.dataFields.value = valueOptions.key;
    chart.dataFields.name = nameOptions.key;
    chart.colors.baseColor = am4core.color(palette.violet[700]);
    chart.zoomOutButton.disabled = true;
    chart.dataFields.color = 'backgroundColor';


    const series = drawSeries(chart, nameOptions);
    drawSeriesLabelBullet(series, nameOptions, totalValue);
};
