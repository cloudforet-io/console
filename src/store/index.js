
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import page from './page';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        page
    },
    strict: debug

});
