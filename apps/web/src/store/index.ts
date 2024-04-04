import Vue from 'vue';
import Vuex from 'vuex';

import display from './modules/display';
import domain from './modules/domain';
import error from './modules/error';
import favorite from './modules/favorite';
import service from './modules/service';
import settings from './modules/settings';
// eslint-disable-next-line import/no-cycle
import user from './modules/user';
// eslint-disable-next-line import/no-cycle
import plugins from './plugins';

Vue.use(Vuex);

const store = new Vuex.Store<any>({
    modules: {
        user,
        settings,
        domain,
        favorite,
        display,
        service,
        error,
    },
    plugins,
});

export { store };
