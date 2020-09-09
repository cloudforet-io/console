import project from './project';
import serviceAccount from './service-account';
import secret from './secret';
import collector from './collector';
import provider from './provider';
import region from './region';
import * as actions from './actions';

export default {
    namespaced: true,
    modules: {
        project,
        serviceAccount,
        secret,
        collector,
        provider,
        region,
    },
    actions,
};
