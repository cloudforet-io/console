
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import header from './header';
import modal from './modal';
import layout from './layout';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        modal,
        header,
        layout
    },
    strict: debug

});
