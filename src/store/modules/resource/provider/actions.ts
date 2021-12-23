import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import { indigo } from '@/styles/colors';
import { assetUrlConverter } from '@/lib/helper/asset-helper';

export const load = async ({ commit, state }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.provider.list({
            query: {
                only: ['provider', 'name', 'tags'],
                sort: {
                    key: 'provider',
                },
            },
        }, { timeout: 2000 });
        const providers: ResourceMap = {};

        response.results.forEach((providerInfo: any): void => {
            providers[providerInfo.provider] = {
                label: providerInfo.tags.label || providerInfo.name,
                name: providerInfo.name,
                icon: assetUrlConverter(providerInfo.tags.icon),
                color: providerInfo.tags.color || indigo[400],
                linkTemplate: providerInfo.tags.external_link_template,
            };
        });

        commit('setProviders', providers);
    } catch (e) {}
};
