import * as am4core from '@amcharts/amcharts4/core';
import { PieSeries, Legend } from '@amcharts/amcharts4/charts';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const getPieSeries = (nameOptions: DynamicField, valueOptions: DynamicField, disableTooltip: boolean): PieSeries => {
    const series = new PieSeries();
    series.dataFields.value = valueOptions.key;
    series.dataFields.category = nameOptions.key;
    series.labels.template.disabled = true;
    if (series.tooltip) series.tooltip.disabled = disableTooltip;

    const sliceTemplate = series.slices.template;
    sliceTemplate.clickable = false;
    sliceTemplate.properties.hoverable = false;
    sliceTemplate.propertyFields.fill = 'color';
    sliceTemplate.tooltipText = '{category}: $ {value}';

    const sliceKeys = sliceTemplate.states.getKey('hover');
    if (sliceKeys) sliceKeys.properties.scale = 1;

    return series;
};


export const getLegends = (): Legend => {
    const legend = new Legend();
    legend.contentAlign = 'left';
    legend.fontSize = 12;
    legend.valueLabels.template.text = '';
    legend.useDefaultMarker = true;
    legend.itemContainers.template.clickable = false;
    legend.itemContainers.template.focusable = false;
    legend.itemContainers.template.hoverable = false;
    legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;

    const marker: any = legend.markers.template;
    marker.children.getIndex(0).cornerRadius(12, 12, 12, 12);
    marker.width = 8;
    marker.height = 8;

    return legend;
};
