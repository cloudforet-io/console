import { Action, Dispatch } from 'vuex';
import dayjs from 'dayjs';
import { CURRENCY, DEFAULT_CURRENCY_RATES, SIDEBAR_TYPE } from '@/store/modules/display/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { CurrencyRates, DisplayState } from '@/store/modules/display/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


export const showHandbook = ({ commit }): void => {
    commit('setVisibleSidebar', true);
    commit('setSidebarType', SIDEBAR_TYPE.handbook);
};

export const showInfo = ({ commit }): void => {
    commit('setSidebarType', SIDEBAR_TYPE.info);
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

export const startDownloading = ({ commit }): void => {
    commit('setIsDownloaded', false);
};

export const finishDownloading = ({ commit }): void => {
    commit('setIsDownloaded', true);
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

let checkNotificationInterval: number|undefined;
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
    currency: CURRENCY;
    rate: number;
    is_default: boolean;
}

const getCurrencyRates = async (): Promise<CurrencyRates> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.exchangeRate.list();

        const rates = {} as CurrencyRates;
        results.forEach(({ currency, rate }: ExchangeRateData) => {
            rates[currency] = rate;
        });
        return rates;
    } catch (e) {
        ErrorHandler.handleError(e);
        return DEFAULT_CURRENCY_RATES;
    }
};

interface CurrencyRatesStoredData {
    rates: CurrencyRates;
    expireTime: string;
}

const storeCurrencyRates = (rates, dispatch: Dispatch) => {
    const currencyRatesStoreData: CurrencyRatesStoredData = {
        rates,
        expireTime: dayjs().add(1, 'day').toISOString(),
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
    if (dayjs(storedData?.expireTime).isBefore(now, 'day') && storedData?.rates) {
        commit('setCurrencyRates', storedData.rates);
        return;
    }

    const rates = await getCurrencyRates();
    commit('setCurrencyRates', rates);
    if (rates !== DEFAULT_CURRENCY_RATES) {
        storeCurrencyRates(rates, dispatch);
    }
};
