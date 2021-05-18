import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.secret.secret.list({
            query: {
                only: ['secret_id', 'name'],
            },
        }, { timeout: 2000 });
        const secrets: ResourceMap = {};

        response.results.forEach((secretInfo: any): void => {
            secrets[secretInfo.secret_id] = {
                label: secretInfo.name,
                name: secretInfo.name,
            };
        });

        commit('setSecrets', secrets);
    } catch (e) {}
};
