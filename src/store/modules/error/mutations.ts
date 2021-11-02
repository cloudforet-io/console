import { ErrorState } from './type';

export const setVisibleSessionExpiredError = (state: ErrorState, visible: boolean): void => {
    state.visibleSessionExpiredError = visible;
};

export const setVisibleAuthorizationError = (state: ErrorState, visible: boolean): void => {
    state.visibleAuthorizationError = visible;
};
