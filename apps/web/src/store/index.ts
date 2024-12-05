import Vue from 'vue';
import Vuex from 'vuex';

import display from './modules/display';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import plugins from './plugins';

Vue.use(Vuex);

const store = new Vuex.Store<any>({
    modules: {
        display,
    },
    plugins,
});

export { store };
