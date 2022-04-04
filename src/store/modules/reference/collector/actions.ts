import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap, ResourceState } from '@/store/modules/reference/type';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.inventory.collector.list({
            query: {
                only: ['collector_id', 'name', 'tags'],
            },
        }, { timeout: 3000 });
        const collectors: ResourceMap = {};

        response.results.forEach((collectorInfo: any): void => {
            collectors[collectorInfo.collector_id] = {
                label: collectorInfo.name,
                name: collectorInfo.name,
                icon: assetUrlConverter(collectorInfo.tags.icon),
            };
        });

        commit('setCollectors', collectors);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ResourceState, any> = ({ state, commit }, collectorInfo): void => {
    const collectors = {
        ...state.items,
        [collectorInfo.collector_id]: {
            label: collectorInfo.name,
            name: collectorInfo.name,
            icon: assetUrlConverter(collectorInfo.tags.icon),
        },
    };
    commit('setCollectors', collectors);
};
