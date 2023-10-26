import type { NumberFormatOptions } from 'vue-i18n';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';


/*
  IANA Language Subtag Registry: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
 */
const currencyToLocaleMap: Record<Currency, string> = {
    [CURRENCY.KRW]: 'ko',
    [CURRENCY.JPY]: 'ja',
    [CURRENCY.USD]: 'en',
};
const currencyToMinimumFractionDigitsMap: Record<Currency, number> = {
    [CURRENCY.KRW]: 0,
    [CURRENCY.JPY]: 0,
    [CURRENCY.USD]: 2,
};

/**
 * @name currencyMoneyFormatter
 * @param value
 * @param options
 * @description Get formatted currency string.
 If given value is undefined, returns '--'.
 */
export const currencyMoneyFormatter = (
    value?: number,
    options: NumberFormatOptions = {},
): string => {
    if (typeof value === 'number') {
        const _shorten = Math.abs(value) >= 10000;
        const _currency = options?.currency ?? CURRENCY.USD;
        const _digit = currencyToMinimumFractionDigitsMap[_currency];

        const _options: NumberFormatOptions = {
            notation: _shorten ? 'compact' : 'standard',
            maximumFractionDigits: _shorten ? 2 : _digit,
            minimumFractionDigits: _shorten ? 0 : _digit,
            style: 'currency',
            currency: options?.currency ?? CURRENCY.USD,
            ...options,
        };

        return Intl.NumberFormat(currencyToLocaleMap[_currency], _options).format(value);
    }

    return '--';
};
