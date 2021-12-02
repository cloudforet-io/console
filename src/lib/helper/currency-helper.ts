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
 * @name getCurrencyAppliedMoney
 * @param value
 * @param currency
 * @param rates
 * @description Convert usd value to currency applied value(ex. KRW, JPY). Rounding places are different for each currency.
 * @example
 * value 1,000, currency USD -> 1,000.00
 * value 1,000, currency KRW -> 1,200,000
 */
const getCurrencyAppliedMoney = (value: number, currency?: CURRENCY, rates?: CurrencyRates): number => {
    let _money = value;
    if (currency && rates) {
        _money = convertUSDToCurrency(value, currency, rates);
    }

    if (currency === CURRENCY.KRW || currency === CURRENCY.JPY) {
        _money = Math.round(_money);
    } else {
        _money = Math.round(_money * 100) / 100;
    }

    return _money;
};

/**
 * @name getFormattedMoney
 * @param money
 * @param transitionValue
 * @description Get formatted money according to transition value.
 * @example
 * money 1,000, transitionValue 1,000 -> 1K
 * money 1,000, transitionValue 10,000 -> 1,000
 */
const getFormattedMoney = (money: number, transitionValue: number): number|string => {
    if (Math.abs(money) < transitionValue) {
        return Math.round(money * 100) / 100;
    }
    const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 2 };
    return Intl.NumberFormat('en', options).format(money);
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
        const _money = getCurrencyAppliedMoney(value, currency, rates);
        const _formattedMoney = getFormattedMoney(_money, transitionValue);

        if (disableSymbol) return _formattedMoney;
        return `${_symbol}${_formattedMoney}`;
    }

    return '--';
};
