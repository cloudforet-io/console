import type * as am5 from '@amcharts/amcharts5';
import { Percent } from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

export const createTreeMapSeries = (
    root: am5.Root,
    settings?: am5hierarchy.ITreemapSettings,
): am5hierarchy.Treemap => root.container.children.push(am5hierarchy.Treemap.new(root, {
    childDataField: 'children',
    topDepth: 1,
    initialDepth: 1,
    ...settings,
}));

export const setTreemapTooltipText = (series: am5hierarchy.Treemap, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    tooltip.label.setAll({
        fontSize: 14,
    });
    const valueFieldName = series.get('valueField') || '';
    const colorFieldName = 'background_color';

    tooltip.label.adapters.add('text', (_, target) => {
        const colorValue = target.dataItem?.dataContext?.[colorFieldName] || 'black';
        let value = target.dataItem?.dataContext?.[valueFieldName] || '-';

        if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
        return `[${colorValue}; fontSize: 10px]●[/] {category}: [bold]${value}[/] ({valuePercentTotal.formatNumber("0.00")}%)`;
    });
};

export const setTreemapLabelText = (series: am5hierarchy.Treemap, settings?: am5hierarchy.ITreemapSettings): void => {
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
