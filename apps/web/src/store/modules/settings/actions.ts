import type { Action, Commit } from 'vuex';

import dayjs from 'dayjs';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY, DEFAULT_CURRENCY_RATES } from '@/store/modules/settings/config';
import type { Currency, CurrencyRates, SettingsState } from '@/store/modules/settings/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const initSettings: Action<SettingsState, any> = ({ commit, rootState, dispatch }): void => {
    const userId = rootState?.user?.userId;
    if (!LocalStorageAccessor.getItem('spaceConnector/accessToken')) return;
    try {
        const settings = LocalStorageAccessor.getItem(userId);

        if (settings) {
            commit('initUserSettings', settings.global);
        }
        dispatch('loadCurrencyRates');
    } catch (e) {
        console.error(e);
        LocalStorageAccessor.removeItem(userId);
    }
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


const storeCurrencyRates = (rates, commit: Commit) => {
    commit('setCurrencyRates', rates);
    commit('setCurrencyUpdateTime', dayjs().unix());
};

export const loadCurrencyRates: Action<SettingsState, any> = async ({ state, commit }) => {
    const storedCurrencyRate: CurrencyRates|undefined = state.currencyRates;
    const storedUpdateTime: number|undefined = state.currencyUpdateTime;
    const now = dayjs();
    const storedDate = storedUpdateTime ? dayjs.unix(storedUpdateTime) : undefined;
    const storedRates = storedCurrencyRate ?? {};
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
    storeCurrencyRates(rates, commit);
};
