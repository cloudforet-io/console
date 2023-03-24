import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CollectorReferenceMap, CollectorReferenceState } from '@/store/modules/reference/collector/type';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<CollectorReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
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
                key: collectorInfo.collector_id,
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
            key: collectorInfo.collector_id,
            label: collectorInfo.name,
            name: collectorInfo.name,
            icon: assetUrlConverter(collectorInfo.tags.icon),
        },
    };
    commit('setCollectors', collectors);
};
