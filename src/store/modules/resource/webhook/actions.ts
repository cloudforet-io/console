import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/resource/config';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.monitoring.webhook.list({
            query: {
                only: ['webhook_id', 'name'],
            },
        }, { timeout: 3000 });
        const webhooks: ResourceMap = {};

        response.results.forEach((webhookInfo: any): void => {
            webhooks[webhookInfo.webhook_id] = {
                label: webhookInfo.name,
                name: webhookInfo.name,
            };
        });

        commit('setWebhooks', webhooks);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
