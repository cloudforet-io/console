import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap, ResourceState } from '@/store/modules/reference/type';
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
        const response = await SpaceConnector.client.notification.protocol.list({
            query: {
                only: ['protocol_id', 'name'],
            },
        }, { timeout: 3000 });
        const protocols: ResourceMap = {};

        response.results.forEach((protocolInfo: any): void => {
            protocols[protocolInfo.protocol_id] = {
                label: protocolInfo.name,
                name: protocolInfo.name,
            };
        });

        commit('setProtocols', protocols);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ResourceState, any> = ({ state, commit }, protocolInfo): void => {
    const protocols = {
        ...state.items,
        [protocolInfo.protocol_id]: {
            label: protocolInfo.name,
            name: protocolInfo.name,
        },
    };
    commit('setProtocols', protocols);
};
