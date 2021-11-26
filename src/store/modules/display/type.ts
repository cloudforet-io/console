import { CURRENCY, SIDEBAR_TYPE } from '@/store/modules/display/config';

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SIDEBAR_TYPE;
    isInitialized: boolean;
    isDownloaded: boolean;
    uncheckedNotificationCount: number;
    isSignInFailed: boolean;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}

export type CurrencyRates = {
    [K in CURRENCY]: number;
}
