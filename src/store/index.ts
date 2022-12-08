import Vue from 'vue';
import Vuex from 'vuex';

import dashboard from './modules/dashboard';
import display from './modules/display';
import domain from './modules/domain';
import error from './modules/error';
import favorite from './modules/favorite';
import file from './modules/file';
import recent from './modules/recent';
import reference from './modules/reference';
import service from './modules/service';
import settings from './modules/settings';
import user from './modules/user';
import plugins from './plugins';

Vue.use(Vuex);

const store = new Vuex.Store<any>({
    modules: {
        user,
        dashboard,
        settings,
        domain,
        favorite,
        recent,
        reference,
        display,
        file,
        service,
        error,
    },
    plugins,
});

export { store };
