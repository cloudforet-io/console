
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import subHeader from './sub-header';
import modal from './modal';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        modal,
        subHeader
    },
    strict: debug

});
