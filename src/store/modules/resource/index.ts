import project from './project';
import projectGroup from './project-group';
import serviceAccount from './service-account';
import cloudServiceType from './cloud-service-type';
import secret from './secret';
import collector from './collector';
import provider from './provider';
import region from './region';
import * as actions from './actions';

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
    },
    actions,
};
