import Vue from 'vue';
import Vuex from 'vuex';
import layout from './layout';
import page from './page';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        layout,
        page,
    },
    strict: debug,
});
