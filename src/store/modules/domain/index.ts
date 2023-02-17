import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DomainState, DomainConfig } from './type';
import { DOMAIN_CONFIG_TYPE } from './type';

const state: DomainState = {
    domainId: undefined,
    name: undefined,
    extendedAuthType: undefined,
    authOptions: undefined,
    billingEnabled: false,
    extraMenuSet: undefined,
    domainConfig: {
        [DOMAIN_CONFIG_TYPE.EXTRA_MENU]: undefined,
    } as DomainConfig,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
