import { DisplayState } from './type';

export const setVisibleInfo = (state: DisplayState, visible: boolean): void => {
    state.visibleInfo = visible;
};

export const setIsInitialized = (state: DisplayState, isInitialized: boolean): void => {
    state.isInitialized = isInitialized;
};

export const setIsDownloaded = (state: DisplayState, isDownloaded: boolean): void => {
    state.isDownloaded = isDownloaded;
};
