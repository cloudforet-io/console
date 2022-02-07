import { sum } from 'lodash';
import {
    LabelBullet, TreeMap, TreeMapSeries, TreeMapSeriesDataItem,
} from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { palette } from '@/styles/colors';

const drawSeriesLabelBullet = (series: TreeMapSeries, nameOptions: DynamicField): LabelBullet => {
    const labelBullet = series.bullets.push(new LabelBullet());
    labelBullet.locationY = 0.5;
    labelBullet.locationX = 0.5;
    labelBullet.label.text = `[font-size: 14px; {textColor};]{${nameOptions.key}}[/]`;

    return labelBullet;
};

const drawSeries = (chart: TreeMap, nameOptions: DynamicField, total: number): TreeMapSeries => {
    const series = chart.seriesTemplates.create('0');
    if (series.tooltip) series.tooltip.fontSize = 14;
    series.columns.template.stroke = am4core.color('white');
    series.columns.template.strokeWidth = 3;
    series.columns.template.strokeOpacity = 1;
    series.columns.template.adapter.add('tooltipText', (tooltipText, target) => {
        if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
            const dataItem = target.dataItem as TreeMapSeriesDataItem;
            const value = dataItem.value;
            const percentage = (100 * (value ?? 1)) / total;
            return `{${nameOptions.key}}: [bold]${value ?? '-'}[/] (${percentage.toFixed(2)}%)`;
        }
        return tooltipText;
    });
    return series;
};

const getColoredData = (chartData: any[]): any[] => {
    const results: any[] = [];
    chartData.forEach((d, idx) => {
        let backgroundColor = palette.violet[200];
        let textColor = palette.gray[900];
        if (idx < 3) {
            textColor = palette.white;
            if (idx === 0) {
                backgroundColor = palette.violet[700];
            } else if (idx === 1) {
                backgroundColor = palette.violet[500];
            } else {
                backgroundColor = palette.violet[400];
            }
        } else if (idx < 8) {
            backgroundColor = palette.violet[300];
        }

        results.push({
            ...d,
            backgroundColor,
            textColor,
        });
    });
    return results;
};

export const drawTreemapChart = (chart: TreeMap, data: any[], nameOptions: DynamicField, valueOptions: DynamicField) => {
    if (chart.hasLicense() && chart.logo) chart.logo.disabled = true;

    // set color step
    chart.colors.step = 1;

    // set data
    const total = sum(data.map(d => d.value));
    chart.data = getColoredData(data);

    chart.dataFields.value = valueOptions.key;
    chart.dataFields.name = nameOptions.key;
    chart.colors.baseColor = am4core.color(palette.violet[700]);
    chart.zoomOutButton.disabled = true;
    chart.dataFields.color = 'backgroundColor';


    const series = drawSeries(chart, nameOptions, total);
    drawSeriesLabelBullet(series, nameOptions);
};

export const drawDummyTreemapChart = (chart: TreeMap, nameOptions: DynamicField, valueOptions: DynamicField) => {
    if (chart.hasLicense() && chart.logo) chart.logo.disabled = true;

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
