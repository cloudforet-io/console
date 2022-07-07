import * as actions from './actions';
import cloudServiceType from './cloud-service-type';
import collector from './collector';
import * as getters from './getters';
import plugin from './plugin';
import project from './project';
import projectGroup from './project-group';
import protocol from './protocol';
import provider from './provider';
import region from './region';
import secret from './secret';
import serviceAccount from './service-account';
import user from './user';
import webhook from './webhook';

export default {
    namespaced: true,
    modules: {
        project,
        projectGroup,
        serviceAccount,
        cloudServiceType,
        secret,
        collector,
        provider,
        region,
        plugin,
        user,
        protocol,
        webhook,
    },
    actions,
    getters,
};
