export default {
    namespaced: true,
    state: {
        userId: localStorage.userId || null,
        language: localStorage.language || null,
        domainId: sessionStorage.domainId || null,
    },
    mutations: {
        setUserId(state, value) {
            state.userId = value;
            localStorage.userId = value;
        },
        setLocale(state, value) {
            state.locale = value;
            localStorage.language = value;
        },
        setDomainId(state, value) {
            state.locale = value;
            sessionStorage.domainId = value;
        },
    },
    getters: {
        userId: state => state.userId,
        language: state => state.language,
        domainId: state => state.domainId,
    },
};
