import { SIDEBAR_TYPE } from '@/store/modules/display/config';
import { DisplayState } from './type';

export const setVisibleSidebar = (state: DisplayState, visible: boolean): void => {
    state.visibleSidebar = visible;
};

export const setSidebarType = (state: DisplayState, type: SIDEBAR_TYPE): void => {
    state.sidebarType = type;
};

export const setIsInitialized = (state: DisplayState, isInitialized: boolean): void => {
    state.isInitialized = isInitialized;
};

export const setIsDownloaded = (state: DisplayState, isDownloaded: boolean): void => {
    state.isDownloaded = isDownloaded;
};

export const setUncheckedNotificationCount = (state: DisplayState, count: number): void => {
    state.uncheckedNotificationCount = count;
};

export const setIsSignInFailed = (state: DisplayState, isSignInFailed: boolean): void => {
    state.isSignInFailed = isSignInFailed;
};
