
import Vue from 'vue';
import Vuex from 'vuex';


import domain from './domain';
import auth from './auth';
import authOld from './authOld';
import layout from './layout';
import user from './user';
import page from './page';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        domain,
        auth,
        authOld,
        layout,
        user,
        page,
    },
    strict: debug,
});
