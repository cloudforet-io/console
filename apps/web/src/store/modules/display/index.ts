import { SIDEBAR_TYPE } from '@/store/modules/display/config';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DisplayState } from './type';

const state: DisplayState = {
    visibleSidebar: false,
    sidebarType: SIDEBAR_TYPE.info,
    isInitialized: false,
    isLoading: false,
    uncheckedNotificationCount: 0,
    isSignInFailed: false,
    visibleMobileGuideModal: false,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
