import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.inventory.collector.list({
        query: {
            only: ['collector_id', 'name', 'tags'],
        },
    });
    const collectors: ResourceMap = {};

    response.results.forEach((collectorInfo: any): void => {
        collectors[collectorInfo.collector_id] = {
            label: collectorInfo.name,
            icon: collectorInfo.tags.icon,
        };
    });

    commit('setCollectors', collectors);
};
