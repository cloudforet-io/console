export const SIDEBAR_TYPE = Object.freeze({
    info: 'primary',
    handbook: 'secondary',
    widget: 'widget',
});
export type SidebarType = typeof SIDEBAR_TYPE[keyof typeof SIDEBAR_TYPE];

export const CURRENCY = Object.freeze({
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY',
});

export const CURRENCY_SYMBOL = Object.freeze({
    USD: '$',
    KRW: '₩',
    JPY: '¥',
});
