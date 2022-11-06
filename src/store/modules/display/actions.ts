import type { Action, Dispatch } from 'vuex';

import dayjs from 'dayjs';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { Currency } from '@/store/modules/display/config';
import {
    CURRENCY, DEFAULT_CURRENCY_RATES, SIDEBAR_TYPE,
} from '@/store/modules/display/config';
import type { CurrencyRates, DisplayState } from '@/store/modules/display/type';

import {
    hideLoadingMessage, showLoadingMessage, showSuccessMessage,
} from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const showHandbook = ({ commit }): void => {
    commit('setVisibleSidebar', true);
    commit('setSidebarType', SIDEBAR_TYPE.handbook);
};

export const showInfo = ({ commit }): void => {
    commit('setSidebarType', SIDEBAR_TYPE.info);
    commit('setVisibleSidebar', true);
};

export const showWidget = ({ commit }): void => {
    commit('setSidebarType', SIDEBAR_TYPE.widget);
    commit('setVisibleSidebar', true);
};

export const hideSidebar = ({ commit }): void => {
    commit('setVisibleSidebar', false);
};

export const startInitializing = ({ commit }): void => {
    commit('setIsInitialized', false);
};

export const finishInitializing = ({ commit }): void => {
    commit('setIsInitialized', true);
};

interface StartLoadingPayload {loadingMessage?: string}
export const startLoading = ({ state, commit }, { loadingMessage }: StartLoadingPayload = {}): void => {
    if (!state.isLoading) {
        commit('setIsLoading', true);
        showLoadingMessage(loadingMessage, '');
    }
};

interface FinishLoadingPayload { successMessage?: string}
export const finishLoading = ({ commit }, { successMessage }: FinishLoadingPayload = {}): void => {
    commit('setIsLoading', false);
    hideLoadingMessage();
    if (successMessage) {
        setTimeout(() => {
            showSuccessMessage(successMessage, '');
        }, 500);
    }
};

export const showSignInErrorMessage = ({ commit }): void => {
    commit('setIsSignInFailed', true);
};

export const hideSignInErrorMessage = ({ commit }): void => {
    commit('setIsSignInFailed', false);
};

const fixedCheckNotificationFilter: QueryStoreFilter = { k: 'is_read', v: false, o: '=' };
const checkNotificationQueryHelper = new ApiQueryHelper().setCountOnly();
export const checkNotification: Action<DisplayState, any> = async ({
    commit, state, rootState, rootGetters,
}): Promise<void> => {
    try {
        const currentTime = dayjs();

        checkNotificationQueryHelper.setFilters([
            fixedCheckNotificationFilter,
            { k: 'created_at', v: currentTime.format('YYYY-MM-DD HH:mm:ss'), o: '<=t' },
            { k: 'user_id', v: rootState.user.userId, o: '=' },
        ]);

        const lastCheckedTime = rootGetters['settings/getItem']('last_checked_notification', '/gnb');
        const minimumCheckTime = currentTime.subtract(7, 'day');

        if (lastCheckedTime && dayjs(lastCheckedTime).isAfter(minimumCheckTime)) {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: lastCheckedTime, o: '>t' },
            );
        } else {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: minimumCheckTime.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
            );
        }

        const { total_count } = await SpaceConnector.client.notification.notification.list({
            query: checkNotificationQueryHelper.data,
        });

        if (state.uncheckedNotificationCount !== total_count) commit('setUncheckedNotificationCount', total_count);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

let checkNotificationInterval: undefined|ReturnType<typeof setTimeout>;
export const stopCheckNotification: Action<DisplayState, any> = ({ commit, dispatch }): void => {
    const lastCheckedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    dispatch('settings/setItem', {
        key: 'last_checked_notification',
        value: lastCheckedTime,
        path: '/gnb',
    }, { root: true });

    commit('setUncheckedNotificationCount', 0);

    if (checkNotificationInterval) {
        clearInterval(checkNotificationInterval);
        checkNotificationInterval = undefined;
    }
};

export const startCheckNotification: Action<DisplayState, any> = ({ dispatch }): void => {
    if (checkNotificationInterval) {
        clearInterval(checkNotificationInterval);
    } else {
        dispatch('checkNotification');
    }

    checkNotificationInterval = setInterval(() => {
        dispatch('checkNotification');
    }, 10000);
};

type ExchangeRateData = {
    currency: Currency;
    rate: number;
    is_default: boolean;
    state: string;
};

const getCurrencyRates = async (): Promise<CurrencyRates> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.exchangeRate.list();

        const rates = { USD: 1 } as CurrencyRates;
        results.forEach(({ currency, rate, state }: ExchangeRateData) => {
            if (CURRENCY[currency] && state === 'ENABLED') rates[currency] = rate;
        });
        return rates;
    } catch (e) {
        ErrorHandler.handleError(e);
        return DEFAULT_CURRENCY_RATES;
    }
};

interface CurrencyRatesStoredData {
    rates: CurrencyRates;
    timestamp: number;
}

const storeCurrencyRates = (rates, dispatch: Dispatch) => {
    const currencyRatesStoreData: CurrencyRatesStoredData = {
        rates,
        timestamp: dayjs().unix(),
    };
    dispatch('settings/setItem', {
        key: 'currencyRates',
        value: currencyRatesStoreData,
        path: '/common',
    }, { root: true });
};

export const loadCurrencyRates: Action<DisplayState, any> = async ({
    commit, dispatch, rootGetters,
}) => {
    const storedData: CurrencyRatesStoredData|undefined = rootGetters['settings/getItem']('currencyRates', '/common');
    const now = dayjs();
    const storedDate = storedData?.timestamp ? dayjs.unix(storedData?.timestamp) : undefined;
    const storedRates = storedData?.rates ?? {};
    const isDateStoredToday = storedDate ? storedDate.isSame(now, 'day') : false;
    if (isDateStoredToday) {
        const localData = { USD: 1 };
        Object.keys(storedRates).forEach((k) => {
            if (CURRENCY[k]) localData[k] = storedRates[k];
        });
        commit('setCurrencyRates', localData);
        return;
    }

    const rates = await getCurrencyRates();
    commit('setCurrencyRates', rates);
    storeCurrencyRates(rates, dispatch);
};

export const showMobileGuideModal: Action<DisplayState, any> = ({ commit }) => {
    commit('setVisibleMobileGuideModal', true);
};
