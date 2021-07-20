import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.monitoring.webhook.list({
            query: {
                only: ['webhook_id', 'name'],
            },
        }, { timeout: 2000 });
        const webhooks: ResourceMap = {};

        response.results.forEach((webhookInfo: any): void => {
            webhooks[webhookInfo.webhook_id] = {
                label: webhookInfo.name,
                name: webhookInfo.name,
            };
        });

        commit('setWebhooks', webhooks);
    } catch (e) {}
};
