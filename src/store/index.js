
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import header from './header';
import layout from './layout';
import page from './page';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        header,
        layout,
        page
    },
    strict: debug

});
