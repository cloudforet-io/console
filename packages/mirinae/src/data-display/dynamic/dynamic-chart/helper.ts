import type { PieSeriesDataItem, TreeMapSeriesDataItem } from '@amcharts/amcharts4/charts';
import {
    PieSeries,
    TreeMapSeries,
} from '@amcharts/amcharts4/charts';

import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const drawSeriesTooltip = (series: TreeMapSeries|PieSeries, nameOptions: DynamicField): TreeMapSeries|PieSeries => {
    series.calculatePercent = true;

    if (series.tooltip) {
        series.tooltip.disabled = false;
        series.tooltip.fontSize = 14;
    }
    if (series instanceof PieSeries) {
        series.slices.template.adapter.add('tooltipText', (tooltipText, target) => {
            if (target.tooltipDataItem && target.tooltipDataItem.dataContext && target.dataItem) {
                const dataItem = target.dataItem as PieSeriesDataItem;
                const value = dataItem.value;
                const percentage = dataItem.values.value.percent;
                return `{${nameOptions.key}}: [bold]${value ?? '-'}[/] (${percentage.toFixed(2)}%)`;
            }
            return tooltipText;
        });
    } else if (series instanceof TreeMapSeries) {
        series.columns.template.adapter.add('tooltipText', (tooltipText, target) => {
            if (target.tooltipDataItem && target.tooltipDataItem.dataContext && target.dataItem) {
                const dataItem = target.dataItem as TreeMapSeriesDataItem;
                const value = dataItem.value;
                const percentage = dataItem.treeMapDataItem.percent;
                return `{${nameOptions.key}}: [bold]${value ?? '-'}[/] (${percentage.toFixed(2)}%)`;
            }
            return tooltipText;
        });
    }
    return series;
};
