export const showSessionExpiredError = ({ commit }): void => {
    commit('setVisibleSessionExpiredError', true);
};

export const showAuthorizationError = ({ commit }): void => {
    commit('setVisibleAuthorizationError', true);
};

export const resetErrorState = ({ commit }): void => {
    commit('resetState');
};
