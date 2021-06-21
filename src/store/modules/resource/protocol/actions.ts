import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.notification.protocol.list({
            query: {
                only: ['protocol_id', 'name'],
            },
        }, { timeout: 2000 });
        const protocols: ResourceMap = {};

        response.results.forEach((protocolInfo: any): void => {
            protocols[protocolInfo.protocol_id] = {
                label: protocolInfo.name,
                name: protocolInfo.name,
            };
        });

        commit('setProtocols', protocols);
    } catch (e) {}
};
