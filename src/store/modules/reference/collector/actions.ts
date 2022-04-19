import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { CollectorReferenceMap, CollectorReferenceState } from '@/store/modules/reference/collector/type';

let lastLoadedTime = 0;

export const load: Action<CollectorReferenceState, any> = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
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
        const collectors: CollectorReferenceMap = {};

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

export const sync: Action<CollectorReferenceState, any> = ({ state, commit }, collectorInfo): void => {
    const collectors: CollectorReferenceMap = {
        ...state.items,
        [collectorInfo.collector_id]: {
            label: collectorInfo.name,
            name: collectorInfo.name,
            icon: assetUrlConverter(collectorInfo.tags.icon),
        },
    };
    commit('setCollectors', collectors);
};
