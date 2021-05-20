import { SIDEBAR_TYPE } from '@/store/modules/display/config';

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
