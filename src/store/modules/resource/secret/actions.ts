import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.secret.secret.list({
        query: {
            only: ['secret_id', 'name'],
        },
    });
    const secrets: ResourceMap = {};

    response.results.forEach((secretInfo: any): void => {
        secrets[secretInfo.secret_id] = {
            label: secretInfo.name,
        };
    });

    commit('setSecrets', secrets);
};
