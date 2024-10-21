export const SIDEBAR_TYPE = {
    info: 'primary',
    handbook: 'secondary',
    widget: 'widget',
} as const;
export type SidebarType = typeof SIDEBAR_TYPE[keyof typeof SIDEBAR_TYPE];

export const CURRENCY = {
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY',
} as const;

export const CURRENCY_SYMBOL = {
    USD: '$',
    KRW: '₩',
    JPY: '¥',
} as const;
