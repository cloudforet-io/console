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
        let icon;
        collectorInfo.tags.forEach((tag) => {
            if (tag.key === 'icon') icon = tag.value;
        });

        collectors[collectorInfo.collector_id] = {
            label: collectorInfo.name,
            name: collectorInfo.name,
            icon,
        };
    });

    commit('setCollectors', collectors);
};
