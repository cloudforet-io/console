import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.serviceAccount.list({
            query: {
                only: ['service_account_id', 'name'],
            },
        }, { timeout: 2000 });
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
