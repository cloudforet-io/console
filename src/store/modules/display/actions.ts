export const showInfo = ({ commit }): void => {
    commit('setVisibleInfo', true);
};

export const hideInfo = ({ commit }): void => {
    commit('setVisibleInfo', false);
};
