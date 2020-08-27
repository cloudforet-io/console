import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.provider.list({
        query: {
            only: ['provider', 'name', 'tags'],
        },
    });
    const providers: ResourceMap = {};

    response.results.forEach((providerInfo: any): void => {
        providers[providerInfo.provider] = {
            label: providerInfo.name,
            color: providerInfo.tags.color,
            icon: providerInfo.tags.icon,
        };
    });

    commit('setProviders', providers);
};
