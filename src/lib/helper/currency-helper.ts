import { convert as cashifyConvert } from 'cashify';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

/** cashify library: https://www.npmjs.com/package/cashify */

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
 * @name getFormattedMoney
 * @param money
 * @param transitionValue
 * @param currency
 * @description Get formatted money according to transition value.
 * @example
 * money 1,000, transitionValue 1,000 -> 1K
 * money 1,000, transitionValue 10,000 -> 1,000
 */
const getFormattedMoney = (money: number, transitionValue: number, currency?: CURRENCY): number|string => {
    let _formattedMoney;
    if (currency === CURRENCY.KRW || currency === CURRENCY.JPY) {
        _formattedMoney = Math.round(money); // 123.456 -> 123
    } else {
        _formattedMoney = Math.round(money * 100) / 100; // 123.456 -> 123.46
    }

    if (Math.abs(money) < transitionValue) {
        const _digits = (currency === CURRENCY.KRW || currency === CURRENCY.JPY) ? 0 : 2;
        return _formattedMoney.toLocaleString('en', { minimumFractionDigits: _digits }); // 1234.56 -> 1,234.56
    }

    const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 2 };
    return Intl.NumberFormat('en', options).format(money); // 1234.56 -> 1.23K
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
    currency?: CURRENCY,
    rates?: CurrencyRates,
    disableSymbol = false,
    transitionValue = 10000,
): string|number => {
    if (typeof value === 'number') {
        const _symbol = (currency && !disableSymbol) ? CURRENCY_SYMBOL[currency] : '';
        const _money = (currency && rates) ? convertUSDToCurrency(value, currency, rates) : value;
        const _formattedMoney = getFormattedMoney(_money, transitionValue, currency);

        if (disableSymbol) return _formattedMoney;
        return `${_symbol}${_formattedMoney}`;
    }

    return '--';
};
