import { SIDEBAR_TYPE } from '@/store/modules/display/config';
import { DisplayState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: DisplayState = {
    visibleSidebar: false,
    sidebarType: SIDEBAR_TYPE.info,
    isInitialized: false,
    isDownloaded: false,
    uncheckedNotificationCount: 0,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
