import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { ServiceAccountReferenceMap, ServiceAccountReferenceState } from '@/store/modules/reference/service-account/type';

let lastLoadedTime = 0;

export const load: Action<ServiceAccountReferenceState, any> = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
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
