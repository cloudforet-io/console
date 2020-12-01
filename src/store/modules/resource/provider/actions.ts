import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import { indigo } from '@/styles/colors';

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
        let icon;
        let color = indigo[400];
        let linkTemplate;

        providerInfo.tags.forEach((tag) => {
            if (tag.key === 'color') color = tag.value;
            else if (tag.key === 'icon') icon = tag.value;
            else if (tag.key === 'external_link_template') linkTemplate = tag.value;
        });

        providers[providerInfo.provider] = {
            label: SPECIAL_LABEL_MAP[providerInfo.provider] || providerInfo.name,
            name: providerInfo.name,
            icon,
            color,
            linkTemplate,
        };
    });

    commit('setProviders', providers);
};
