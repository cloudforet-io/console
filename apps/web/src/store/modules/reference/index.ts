import type { ReferenceRootState } from '@/store/modules/reference/type';

// eslint-disable-next-line import/no-cycle
import * as actions from './actions';
import cloudServiceType from './cloud-service-type';
import collector from './collector';
import * as getters from './getters';
import * as mutations from './mutations';
import plugin from './plugin';
import protocol from './protocol';
import provider from './provider';
import region from './region';
import secret from './secret';
import serviceAccount from './service-account';
import trustedAccount from './trusted-account';
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
        serviceAccount,
        trustedAccount,
        cloudServiceType,
        secret,
        collector,
        provider,
        region,
        plugin,
        protocol,
        webhook,
    },
};
