import { SIDEBAR_TYPE } from '@/store/modules/display/config';
import { DisplayState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

export const STORAGE_KEY = 'store/display';

let storedDisplayState: Partial<DisplayState> = {};

try {
    storedDisplayState = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
} catch (e) {
    window.localStorage.removeItem(STORAGE_KEY);
}

const state: DisplayState = {
    visibleSidebar: storedDisplayState.visibleSidebar ?? false,
    sidebarType: storedDisplayState.sidebarType ?? SIDEBAR_TYPE.info,
    isInitialized: storedDisplayState.isInitialized ?? false,
    isDownloaded: storedDisplayState.isDownloaded ?? false,
    uncheckedNotificationCount: storedDisplayState.uncheckedNotificationCount ?? 0,
    isSignInFailed: storedDisplayState.isSignInFailed ?? false,
    currency: storedDisplayState.currency ?? 'USD',
    currencyRates: storedDisplayState.currencyRates ?? {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
