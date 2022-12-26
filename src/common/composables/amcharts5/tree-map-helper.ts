import type * as am5 from '@amcharts/amcharts5';
import { color, Percent } from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { white } from '@/styles/colors';

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

    const categoryFieldName = series.get('categoryField') || '';
    const valueFieldName = series.get('valueField') || '';

    tooltip.label.adapters.add('text', (_, target) => {
        let value = target.dataItem?.dataContext?.[valueFieldName] || '-';
        if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
        return `{${categoryFieldName}}: [bold]${value}[/] ({valuePercentTotal.formatNumber("0.00")}%)`;
    });
};

export const setTreemapLabelText = (series: am5hierarchy.Treemap): void => {
    series.labels.template.setAll({
        fontSize: 14,
        fill: color(white),
        text: '{category}',
        position: 'absolute',
        y: 15,
        dx: 8,
        width: new Percent(100),
        ellipsis: '...',
    });
};
