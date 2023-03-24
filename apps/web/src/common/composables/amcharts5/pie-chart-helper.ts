import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import type { IPieChartSettings } from '@amcharts/amcharts5/.internal/charts/pie/PieChart';
import type { IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import * as am5percent from '@amcharts/amcharts5/percent';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { gray } from '@/styles/colors';

export const createPieChart = (root: Root, settings?: IPieChartSettings): am5percent.PieChart => root.container.children.push(
    am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        ...settings,
    }),
);

export const createDonutChart = (root: Root, settings?: IPieChartSettings): am5percent.PieChart => root.container.children.push(
    am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(85),
        ...settings,
    }),
);

export const createPieSeries = (root: Root, settings?: IPieSeriesSettings): am5percent.PieSeries => {
    const series: am5percent.PieSeries = am5percent.PieSeries.new(root, {
        ...settings,
    });
    series.ticks.template.set('visible', false);
    series.labels.template.set('forceHidden', true);
    series.slices.template.setAll({
        scale: 1,
        toggleKey: 'none',
    });
    series.slices.template.states.create('hover', {
        scale: 1,
    });
    return series;
};

export const setPieTooltipText = (series: am5percent.PieSeries, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    tooltip.label.setAll({
        fill: am5.color(gray[900]),
        fontSize: 14,
    });

    const categoryFieldName = series.get('categoryField') || '';
    const valueFieldName = series.get('valueField') || '';

    series.slices.template.adapters.add('tooltipText', (_, target) => {
        let value = target.dataItem?.dataContext?.[valueFieldName];
        if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
        const colorHex = target.get('stroke')?.toString();
        return `[${colorHex}; fontSize: 10px]●[/] {${categoryFieldName}}: [bold]${value}[/] ({valuePercentTotal.formatNumber("0.00")}%)`;
    });
};
