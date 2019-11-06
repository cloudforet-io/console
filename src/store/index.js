
import Vue from 'vue';
import Vuex from 'vuex';

import domain from './domain';
import auth2 from './auth2';
import auth from './auth';
import header from './header';
import layout from './layout';
import page from './page';
import layout from './layout';
import user from './user';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        domain,
        auth,
        auth2,
        header,
        layout,
        user,
        page,
    },
    strict: debug

});
