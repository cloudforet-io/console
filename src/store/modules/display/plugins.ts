import { STORAGE_KEY } from '@/store/modules/display';
import { Store } from 'vuex';

const DISPLAY_MUTATIONS = ['display/setCurrencyRates'];

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (DISPLAY_MUTATIONS.includes(mutation.type)) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currency: state.display.currency,
                currencyRates: state.display.currencyRates,
            }));
        }
    });
};

export default [
    localStoragePlugin,
];
