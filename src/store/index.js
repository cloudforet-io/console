import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import domain from './modules/domain';
import resource from './modules/resource';
import plugins from './plugins';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        user,
        domain,
        resource,
    },
    plugins,
});
