import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

const SPECIAL_LABEL_MAP = {
    // eslint-disable-next-line camelcase
    google_cloud: 'Google',
    azure: 'Azure',
};

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.provider.list({
        query: {
            only: ['provider', 'name', 'tags'],
        },
    });
    const providers: ResourceMap = {};

    response.results.forEach((providerInfo: any): void => {
        providers[providerInfo.provider] = {
            label: SPECIAL_LABEL_MAP[providerInfo.provider] || providerInfo.name,
            name: providerInfo.name,
            color: providerInfo.tags.color,
            icon: providerInfo.tags.icon,
            // eslint-disable-next-line camelcase
            linkTemplate: providerInfo.tags?.external_link_template,
        };
    });

    commit('setProviders', providers);
};
