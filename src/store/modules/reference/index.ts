import type { ReferenceRootState } from '@/store/modules/reference/type';

import * as actions from './actions';
import cloudServiceType from './cloud-service-type';
import collector from './collector';
import * as getters from './getters';
import * as mutations from './mutations';
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

// TODO: This is a temporary state. It must be changed to check each modules' items state is null.
const state: ReferenceRootState = {
    isAllLoaded: false,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
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
};
