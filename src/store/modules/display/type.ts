import { SIDEBAR_TYPE } from '@/store/modules/display/config';

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SIDEBAR_TYPE;
    isInitialized: boolean;
    isDownloaded: boolean;
    uncheckedNotificationCount: number;
    isSignInFailed: boolean;
    currency: Currency;
    currencyRates: CurrencyRates;
}

export type Currency = 'USD'|'KRW'|'JPY'

export type CurrencyRates = Record<string, number>
