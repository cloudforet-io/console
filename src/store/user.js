export default {
    namespaced: true,
    state: {
        userId: localStorage.userId || null,
        locale: localStorage.locale || null,
    },
    mutations: {
        setUserId(state, value) {
            state.userId = value;
            localStorage.userId = value;
        },
        setLocale(state, value) {
            state.locale = value;
            localStorage.locale = value;
        },
    },
    getters: {
        userId: state => state.userId,
        locale: state => state.locale,
    },
};
