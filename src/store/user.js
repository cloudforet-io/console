export default {
    namespaced: true,
    state: {
        userId: localStorage.userId || null,
        locale: localStorage.locale || null,
        domainId: sessionStorage.domainId || null,
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
        setDomainId(state, value) {
            state.locale = value;
            sessionStorage.domainId = value;
        },
    },
    getters: {
        userId: state => state.userId,
        locale: state => state.locale,
        domainId: state => state.domainId,
    },
};
