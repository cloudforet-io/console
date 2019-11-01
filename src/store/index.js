
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import page from './page';
import layout from './layout';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        page,
        layout,
    },
    strict: debug,

});
