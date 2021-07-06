import { SpaceConnector } from '@/core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import { assetUrlConverter } from '@/lib/helper/asset-helper';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.inventory.collector.list({
            query: {
                only: ['collector_id', 'name', 'tags'],
            },
        }, { timeout: 2000 });
        const collectors: ResourceMap = {};

        response.results.forEach((collectorInfo: any): void => {
            collectors[collectorInfo.collector_id] = {
                label: collectorInfo.name,
                name: collectorInfo.name,
                icon: assetUrlConverter(collectorInfo.tags.icon),
            };
        });

        commit('setCollectors', collectors);
    } catch (e) {}
};
