import { convert as cashifyConvert } from 'cashify';
import type { NumberFormatOptions } from 'vue-i18n';


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
 * @param currency
 * @param rates
 * @param disableSymbol
 * @param transitionValue
 * @description Convert given value with given currency and exchange rates, and format into money format.
 If given value is number, it treats it in US dollars and converts it to a given currency based on the given exchange rate.
 It's convert logic follows convertUSDToCurrency function.
 If given value is undefined, returns '--'.
 */
export const currencyMoneyFormatter = (
    value?: number,
    currency: Currency = CURRENCY.USD,
    rates?: CurrencyRates,
    disableSymbol = false,
    transitionValue = 10000,
): string|number => {
    if (typeof value === 'number') {
        const money = (currency && rates) ? convertUSDToCurrency(value, currency, rates) : value;

        const shorten: boolean = Math.abs(money) >= transitionValue;
        const digit = currencyToMinimumFractionDigitsMap[currency];
        const options: NumberFormatOptions = {
            notation: shorten ? 'compact' : 'standard',
            maximumFractionDigits: shorten ? 2 : digit,
            minimumFractionDigits: shorten ? 0 : digit,
            style: disableSymbol ? 'decimal' : 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
        };

        return Intl.NumberFormat(currencyToLocaleMap[currency], options).format(money);
    }

    return '--';
};
