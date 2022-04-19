import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { WebhookReferenceMap, WebhookReferenceState } from '@/store/modules/reference/webhook/type';

let lastLoadedTime = 0;

export const load: Action<WebhookReferenceState, any> = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
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
        const webhooks: WebhookReferenceMap = {};

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

export const sync: Action<WebhookReferenceState, any> = ({ state, commit }, webhookInfo): void => {
    const webhooks: WebhookReferenceMap = {
        ...state.items,
        [webhookInfo.webhook_id]: {
            label: webhookInfo.name,
            name: webhookInfo.name,
        },
    };
    commit('setWebhooks', webhooks);
};
