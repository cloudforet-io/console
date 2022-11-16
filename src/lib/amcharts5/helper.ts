import * as am5 from '@amcharts/amcharts5';
import type * as am5xy from '@amcharts/amcharts5/xy';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { gray } from '@/styles/colors';

export const setChartColors = (chart: am5.SerialChart, colors: string[]) => {
    const am5ColorSet = colors.map((color) => am5.color(color));
    chart.get('colors')?.set('colors', am5ColorSet);
};

export const setSharedTooltipText = (chart: am5xy.XYChart, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    tooltip.label.adapters.add('text', (text, target) => {
        let _text = `[${gray[700]}]{valueX}[/]`;
        chart.series.each((s) => {
            const fieldName = s.get('valueYField') || '';
            let value = target.dataItem?.dataContext?.[fieldName];
            if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
            _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
        });
        return _text;
    });
};

export const setSingleTooltipText = (chart: am5xy.XYChart, tooltip: am5.Tooltip, currency?: Currency, currencyRate?: CurrencyRates): void => {
    let strokeColor;
    let fieldName;
    chart.series.each((series) => {
        strokeColor = series.get('stroke')?.toString();
        fieldName = series.get('name');
    });
    tooltip.label.setAll({
        fill: am5.color(gray[900]),
        fontSize: 14,
    });
    tooltip.label.adapters.add('text', (_, target) => {
        let value = target.dataItem?.dataContext?.[fieldName];
        if (currency) value = currencyMoneyFormatter(value, currency, currencyRate);
        return `[${strokeColor};fontSize: 10px]●[/] {valueX}: [bold]${value}[/]`;
    });
};
