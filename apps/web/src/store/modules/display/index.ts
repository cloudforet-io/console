import { SIDEBAR_TYPE } from '@/store/modules/display/config';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DisplayState } from './type';

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
    isLoading: storedDisplayState.isLoading ?? false,
    uncheckedNotificationCount: storedDisplayState.uncheckedNotificationCount ?? 0,
    isSignInFailed: storedDisplayState.isSignInFailed ?? false,
    visibleMobileGuideModal: false,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
