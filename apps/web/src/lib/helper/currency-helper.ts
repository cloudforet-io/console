import type { NumberFormatOptions } from 'vue-i18n';

import { convert as cashifyConvert } from 'cashify';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates, Currency } from '@/store/modules/settings/type';

/** cashify library: https://www.npmjs.com/package/cashify */

/**
 * @param money
 * @param currency
 * @param rates
 * @description Converts US Dollars to a given currency based on a given exchange rate.
 */
export const convertUSDToCurrency = (money: number, currency: Currency, rates: CurrencyRates): number => cashifyConvert(money, {
    base: CURRENCY.USD,
    rates,
    from: CURRENCY.USD,
    to: currency,
});

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
 * @description Convert given value with given currency and exchange rates, and format into money format.
 If given value is number, it treats it in US dollars and converts it to a given currency based on the given exchange rate.
 It's convert logic follows convertUSDToCurrency function.
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
            currencyDisplay: 'narrowSymbol',
            currency: options?.currency ?? CURRENCY.USD,
            ...options,
        };

        return Intl.NumberFormat(currencyToLocaleMap[_currency], _options).format(value);
    }

    return '--';
};
