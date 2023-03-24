import type { ErrorState } from './type';

const getDefaultState = (): ErrorState => ({
    visibleSessionExpiredError: false,
    visibleAuthorizationError: false,
});

export const setVisibleSessionExpiredError = (state: ErrorState, visible: boolean): void => {
    state.visibleSessionExpiredError = visible;
};

export const setVisibleAuthorizationError = (state: ErrorState, visible: boolean): void => {
    state.visibleAuthorizationError = visible;
};

export const resetState = (state: ErrorState): void => {
    Object.assign(state, getDefaultState());
};
