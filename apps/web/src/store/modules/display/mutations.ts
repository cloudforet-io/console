import type { Mutation } from 'vuex';

import type { Currency, SidebarType } from '@/store/modules/display/config';

import type { CurrencyRates, DisplayState } from './type';

export const setVisibleSidebar: Mutation<DisplayState> = (state, visible: boolean): void => {
    state.visibleSidebar = visible;
};

export const setSidebarType: Mutation<DisplayState> = (state, type: SidebarType): void => {
    state.sidebarType = type;
};

export const setIsInitialized: Mutation<DisplayState> = (state, isInitialized: boolean): void => {
    state.isInitialized = isInitialized;
};

export const setIsLoading: Mutation<DisplayState> = (state, isLoading: boolean): void => {
    state.isLoading = isLoading;
};

export const setUncheckedNotificationCount: Mutation<DisplayState> = (state, count: number): void => {
    state.uncheckedNotificationCount = count;
};

export const setIsSignInFailed: Mutation<DisplayState> = (state, isSignInFailed: boolean): void => {
    state.isSignInFailed = isSignInFailed;
};

export const setCurrency: Mutation<DisplayState> = (state, currency: Currency): void => {
    state.currency = currency;
};

export const setCurrencyRates: Mutation<DisplayState> = (state, rates: CurrencyRates): void => {
    state.currencyRates = rates;
};

export const setVisibleMobileGuideModal: Mutation<DisplayState> = (state, visibleMobileGuideModal: boolean): void => {
    state.visibleMobileGuideModal = visibleMobileGuideModal;
};
