import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import settings from './modules/settings';
import favorite from './modules/favorite';
import domain from './modules/domain';
import resource from './modules/resource';
import plugins from './plugins';
import projectFavorite from './modules/favorite/project';
import projectGroupFavorite from './modules/favorite/project-group';
import cloudServiceTypeFavorite from './modules/favorite/cloud-service-type';
import projectResource from './modules/resource/project';
import serviceAccountResource from './modules/resource/service-account';
import secretResource from './modules/resource/secret';
import collectorResource from './modules/resource/collector';
import providerResource from './modules/resource/provider';
import regionResource from './modules/resource/region';

Vue.use(Vuex);

interface Store {
    user: typeof user.state;
    settings: typeof settings.state;
    domain: typeof domain.state;
    favorite: {
        project: typeof projectFavorite;
        projectGroup: typeof projectGroupFavorite;
        cloudServiceType: typeof cloudServiceTypeFavorite;
    };
    resource: {
        project: typeof projectResource.state;
        serviceAccount: typeof serviceAccountResource.state;
        secret: typeof secretResource.state;
        collector: typeof collectorResource.state;
        provider: typeof providerResource.state;
        region: typeof regionResource.state;
    };
}

const store = new Vuex.Store<Store>({
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
