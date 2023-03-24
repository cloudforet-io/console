import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProtocolReferenceMap, ProtocolReferenceState } from '@/store/modules/reference/protocol/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<ProtocolReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.notification.protocol.list({
            query: {
                only: ['protocol_id', 'name'],
            },
        }, { timeout: 3000 });
        const protocols: ProtocolReferenceMap = {};

        response.results.forEach((protocolInfo: any): void => {
            protocols[protocolInfo.protocol_id] = {
                key: protocolInfo.protocol_id,
                label: protocolInfo.name,
                name: protocolInfo.name,
            };
        });

        commit('setProtocols', protocols);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProtocolReferenceState, any> = ({ state, commit }, protocolInfo): void => {
    const protocols: ProtocolReferenceMap = {
        ...state.items,
        [protocolInfo.protocol_id]: {
            key: protocolInfo.protocol_id,
            label: protocolInfo.name,
            name: protocolInfo.name,
        },
    };
    commit('setProtocols', protocols);
};
