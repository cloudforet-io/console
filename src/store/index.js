import Vue from 'vue';
import Vuex from 'vuex';

import config from './config';
import domain from './domain';
import auth from './auth';
import header from './header';
import layout from './layout';
import page from './page';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        config,
        domain,
        auth,
        header,
        layout,
        page,
    },
    strict: debug,

});
