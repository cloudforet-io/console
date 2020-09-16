import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import settings from './modules/settings';
import domain from './modules/domain';
import resource from './modules/resource';
import plugins from './plugins';
import project from './modules/resource/project';
import serviceAccount from './modules/resource/service-account';
import secret from './modules/resource/secret';
import collector from './modules/resource/collector';
import provider from './modules/resource/provider';
import region from './modules/resource/region';

Vue.use(Vuex);

interface Store {
    user: typeof user.state;
    settings: typeof settings.state;
    domain: typeof domain.state;
    resource: {
        project: typeof project.state;
        serviceAccount: typeof serviceAccount.state;
        secret: typeof secret.state;
        collector: typeof collector.state;
        provider: typeof provider.state;
        region: typeof region.state;
    };
}

const store = new Vuex.Store<Store>({
    modules: {
        user,
        settings,
        domain,
        resource,
    },
    plugins,
});

export { store };
export default store;
