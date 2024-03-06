import { SIDEBAR_TYPE } from '@/store/modules/display/config';

import * as actions from './actions';
// eslint-disable-next-line import/no-cycle
import * as getters from './getters';
import * as mutations from './mutations';
import type { DisplayState } from './type';

const state: DisplayState = {
    visibleSidebar: false,
    sidebarType: SIDEBAR_TYPE.info,
    isInitialized: false,
    uncheckedNotificationCount: 0,
    uncheckedNoticeCount: 0,
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
