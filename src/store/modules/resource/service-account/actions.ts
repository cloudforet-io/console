import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/resource/config';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
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
        const serviceAccounts: ResourceMap = {};

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
