import type { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';

export type Currency = typeof CURRENCY[keyof typeof CURRENCY];
export type CurrencySymbol = typeof CURRENCY_SYMBOL[keyof typeof CURRENCY_SYMBOL];

export type CurrencyRates = {
    [K in Currency]: number;
};

export interface SettingsState {
    currencyRate: CurrencyRates;
    currencyUpdateTime: number|undefined;
    currency: Currency;
    gnbNotificationLastReadTime: string;
}

