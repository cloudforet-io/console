export const CURRENCY = Object.freeze({
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY',
});
export type Currency = typeof CURRENCY[keyof typeof CURRENCY];

export const CURRENCY_SYMBOL = Object.freeze({
    USD: '$',
    KRW: '₩',
    JPY: '¥',
});

export type CurrencySymbol = typeof CURRENCY_SYMBOL[keyof typeof CURRENCY_SYMBOL];

export const DEFAULT_CURRENCY_RATES = Object.freeze({
    USD: 1,
    KRW: 1,
    JPY: 1,
});
