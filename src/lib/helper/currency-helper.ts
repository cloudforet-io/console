import currencyjs from 'currency.js';
import { convert as cashifyConvert } from 'cashify';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

/** cashify library: https://www.npmjs.com/package/cashify */
/** currency library: https://www.npmjs.com/package/currency.js */

/**
 * @param money
 * @param currency
 * @param rates
 * @description Converts US Dollars to a given currency based on a given exchange rate.
 */
export const convertUSDToCurrency = (money: number, currency: CURRENCY, rates: CurrencyRates): number => cashifyConvert(money, {
    base: CURRENCY.USD,
    rates,
    from: CURRENCY.USD,
    to: currency,
});

/**
 * @param money
 * @param currency
 * @param short
 * @description Formats a given number into a form appropriate for a given currency.
 If short is true, round off the decimal point.
 @example
 currency X, short X: 12345 -> 12,345.00
 currency O, short X: 12345 -> $12,345.00
 currency O, short O: 12345 -> $12,345
 currency X, short O: 12345 -> 12,345
 */
export const moneyFormatter = (money: number, currency?: CURRENCY, short?: boolean): string => {
    const symbol = currency ? CURRENCY_SYMBOL[currency] : '';

    return currencyjs(money, { symbol, precision: short ? 0 : 2 }).format();
};

/**
 * @param value
 * @param currency
 * @param rates
 * @param short
 * @description Convert given value with given currency and exchange rates, and format into money format.
 If given value is number, it treats it in US dollars and converts it to a given currency based on the given exchange rate.
 It's convert logic follows convertUSDToCurrency function.
 If given value is undefined, returns '--'.
 It's formatting logic follows moneyFormatter function.
 */
export const currencyMoneyFormatter = (value?: number, currency?: CURRENCY, rates?: CurrencyRates, short?: boolean): string => {
    if (typeof value === 'number') {
        let money = value;
        if (currency && rates) {
            money = convertUSDToCurrency(value, currency, rates);
        }
        return moneyFormatter(money, currency, short);
    }

    return '--';
};
