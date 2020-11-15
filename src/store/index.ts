import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import settings from './modules/settings';
import favorite from './modules/favorite';
import domain from './modules/domain';
import resource from './modules/resource';
import plugins from './plugins';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        user,
        settings,
        domain,
        favorite,
        resource,
    },
    plugins,
});

export { store };
export default store;
