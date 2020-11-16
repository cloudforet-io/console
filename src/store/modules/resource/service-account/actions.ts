import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.serviceAccount.list({
        query: {
            only: ['service_account_id', 'name'],
        },
    });
    const serviceAccounts: ResourceMap = {};

    response.results.forEach((serviceAccountInfo: any): void => {
        serviceAccounts[serviceAccountInfo.service_account_id] = {
            label: serviceAccountInfo.name,
            name: serviceAccountInfo.name,
        };
    });

    commit('setServiceAccounts', serviceAccounts);
};
