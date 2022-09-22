import { SpaceConnector } from 'cloudforet/core-lib/space-connector';
import type { Action } from 'vuex';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ServiceAccountReferenceMap, ServiceAccountReferenceState } from '@/store/modules/reference/service-account/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<ServiceAccountReferenceState, any> = async (
    { state, commit }, options: ReferenceLoadOptions,
): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.serviceAccount.list({
            query: {
                only: ['service_account_id', 'name'],
            },
        }, { timeout: 3000 });
        const serviceAccounts: ServiceAccountReferenceMap = {};

        response.results.forEach((serviceAccountInfo: any): void => {
            serviceAccounts[serviceAccountInfo.service_account_id] = {
                label: serviceAccountInfo.name,
                name: serviceAccountInfo.name,
            };
        });

        commit('setServiceAccounts', serviceAccounts);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ServiceAccountReferenceState, any> = ({ state, commit }, serviceAccountInfo): void => {
    const serviceAccounts: ServiceAccountReferenceMap = {
        ...state.items,
        [serviceAccountInfo.service_account_id]: {
            label: serviceAccountInfo.name,
            name: serviceAccountInfo.name,
        },
    };
    commit('setServiceAccounts', serviceAccounts);
};
