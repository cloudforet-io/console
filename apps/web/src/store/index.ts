import Vue from 'vue';
import Vuex from 'vuex';

// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import display from './modules/display';
import domain from './modules/domain';
import error from './modules/error';
import favorite from './modules/favorite';
// eslint-disable-next-line import/no-cycle
import reference from './modules/reference';
import service from './modules/service';
import settings from './modules/settings';
import user from './modules/user';
import plugins from './plugins';

Vue.use(Vuex);

const store = new Vuex.Store<any>({
    modules: {
        user,
        settings,
        domain,
        favorite,
        reference,
        display,
        service,
        error,
    },
    plugins,
});

export { store };
