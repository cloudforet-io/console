import Vue from 'vue';
import Vuex, {Module, ModuleTree} from 'vuex';
import user from './modules/user';
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
    domain: typeof domain.state;
    resource: {
        project: typeof project.state;
        serviceAccount: typeof serviceAccount.state;
        secret: typeof secret.state;
        collector: typeof collector.state;
        provider: typeof provider.state;
        region: typeof region.state;
    }
}

export const store = new Vuex.Store<Store>({
    modules: {
        user,
        domain,
        resource,
    },
    plugins,
});

export default store;
