import type { Currency } from '@/store/modules/settings/config';

export type CurrencyRates = {
    [K in Currency]: number;
};

export interface SettingsState {
    currencyRate: CurrencyRates;
    currencyUpdateTime: number|undefined;
    gnbNotificationLastReadTime: string;
}
