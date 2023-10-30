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
 * For detailed information on the types of options, please refer to the following link.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 */
export const currencyMoneyFormatter = (
    value?: number,
    options: Intl.NumberFormatOptions = {},
): string|undefined => {
    if (typeof value === 'number') {
        const _value = Math.ceil(value * 100) / 100;
        const _shorten = Math.abs(_value) >= 10000;
        const _currency = options?.currency ?? CURRENCY.USD;
        const _digit = currencyToMinimumFractionDigitsMap[_currency];

        const _options: Intl.NumberFormatOptions = {
            notation: _shorten ? 'compact' : 'standard',
            maximumFractionDigits: _digit,
            minimumFractionDigits: _digit,
            style: 'currency',
            currency: options?.currency ?? CURRENCY.USD,
            ...options,
        };

        return Intl.NumberFormat(currencyToLocaleMap[_currency], _options).format(_value);
    }
    return value;
};
