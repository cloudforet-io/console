export const showInfo = ({ commit }): void => {
    commit('setVisibleInfo', true);
};

export const hideInfo = ({ commit }): void => {
    commit('setVisibleInfo', false);
};

export const startInitializing = ({ commit }): void => {
    commit('setIsInitialized', false);
};

export const finishInitializing = ({ commit }): void => {
    commit('setIsInitialized', true);
};
