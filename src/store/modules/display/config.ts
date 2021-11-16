export enum SIDEBAR_TYPE {
    info = 'primary',
    handbook = 'secondary'
}

export const CURRENCY_SYMBOL = Object.freeze({
    USD: '$',
    KRW: '₩',
    JPY: '¥',
});

export type CURRENCY_SYMBOL = typeof CURRENCY_SYMBOL[keyof typeof CURRENCY_SYMBOL]
