import { SpaceConnector } from '@/lib/space-connector';
import { tagsToObject } from '@/lib/util';
import { ResourceMap } from '@/store/modules/resource/type';
import { indigo } from '@/styles/colors';

const SPECIAL_LABEL_MAP = {
    // eslint-disable-next-line camelcase
    google_cloud: 'Google',
    azure: 'Azure',
    // eslint-disable-next-line camelcase
    oracle_cloud: 'OCI',
};

export const load = async ({ commit, state }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.provider.list({
            query: {
                only: ['provider', 'name', 'tags'],
            },
        });
        const providers: ResourceMap = {};

        response.results.forEach((providerInfo: any): void => {
            const providerTags = tagsToObject(providerInfo.tags);

            providers[providerInfo.provider] = {
                label: SPECIAL_LABEL_MAP[providerInfo.provider] || providerInfo.name,
                name: providerInfo.name,
                icon: providerTags.icon,
                color: providerTags.color || indigo[400],
                linkTemplate: providerTags.external_link_template,
            };
        });

        commit('setProviders', providers);
    } catch (e) {}
};
