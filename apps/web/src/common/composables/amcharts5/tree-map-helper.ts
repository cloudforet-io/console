import type * as am5 from '@amcharts/amcharts5';
import { Percent } from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';


export const createTreeMapSeries = (
    root: am5.Root,
    settings?: am5hierarchy.ITreemapSettings,
): am5hierarchy.Treemap => root.container.children.push(am5hierarchy.Treemap.new(root, {
    childDataField: 'children',
    topDepth: 1,
    initialDepth: 1,
    ...settings,
}));

export const setTreemapTooltipText = (series: am5hierarchy.Treemap, tooltip: am5.Tooltip, valueFormatter?: (value: any, data?: any) => string): void => {
    tooltip.label.setAll({
        fontSize: 14,
    });
    const valueFieldName = series.get('valueField') || '';
    const colorFieldName = 'background_color';

    tooltip.label.adapters.add('text', (_, target) => {
        const colorValue = target.dataItem?.dataContext?.[colorFieldName] || 'black';
        const value = target.dataItem?.dataContext?.[valueFieldName] || '--';
        const formatted = valueFormatter ? valueFormatter(value, target.dataItem?.dataContext) : value;
        return `[${colorValue}; fontSize: 10px]●[/] {category}: [bold]${formatted}[/] ({valuePercentTotal.formatNumber("0.00")}%)`;
    });
};

export const setTreemapLabelText = (series: am5hierarchy.Treemap, settings?: am5.Template<am5.Label>['_settings']): void => {
    series.labels.template.setAll({
        text: '{category}',
        paddingLeft: 4,
        paddingRight: 4,
        width: new Percent(100),
        oversizedBehavior: 'wrap',
        textAlign: 'center',
        fontSize: 14,
        ...settings,
    });
};
