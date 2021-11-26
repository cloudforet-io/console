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
 */
export const moneyFormatter = (money: number, currency?: CURRENCY, short?: boolean): string => {
    const symbol = currency ? CURRENCY_SYMBOL[currency] : '';

    return currencyjs(money, { symbol, precision: short ? 0 : 2 }).format();
};


/**
 * @param money
 * @param currency
 * @param rates
 * @param short
 * @description Converts US Dollars to a given currency based on a given exchange rate,
 and formats converted number into a form appropriate for a given currency.
 If short is true, round off the decimal point.
 */
export const convertAndFormatMoney = (money: number, currency?: CURRENCY, rates?: CurrencyRates, short?: boolean): string => {
    let value = money;

    if (currency && rates) {
        value = convertUSDToCurrency(value, currency, rates);
    }

    return moneyFormatter(value, currency, short);
};
